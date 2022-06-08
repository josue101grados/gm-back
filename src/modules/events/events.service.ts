import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Event, EventType, EventStatus } from './event.entity';
import { ScheduleEventData } from './dto/ScheduleEventData.dto';
import { ConfigService } from '@nestjs/config';
import { InstancesService } from 'modules/instances/instances.service';
// import { SearchService } from 'modules/elasticsearch/elasticsearch.service';
import { UpdateScheduledEventData } from './dto/UpdateScheduledEventData.dto';
import { SearchEventsData } from './dto/SearchEventsData.dto';
import { FunnelsService } from 'modules/funnels/funnels.service';
import { UploadsService } from 'modules/uploads/uploads.service';
import * as Excel from 'exceljs';
import { get } from 'lodash';
import { Raw, MoreThan, LessThan, FindConditions } from 'typeorm';
import { format } from 'date-fns';
import moment = require('moment');

@Injectable()
export class EventsService extends TypeOrmCrudService<Event> {
  private instanceSlug;
  constructor(
    @InjectRepository(Event) repo,
    private configService: ConfigService,
    private intancesService: InstancesService,
    // @Inject(forwardRef(() => SearchService))
    // private searchService: SearchService,
    @Inject(forwardRef(() => FunnelsService))
    private funnelsService: FunnelsService,
    private uploadsService: UploadsService,
  ) {
    super(repo);
    this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
  }

  /**
   * Get Exception in a specific date YYYY-MM-DD
   * @param date Date in YYYY-MM-DD format
   */
  async getExceptionEventsByDate(date: string) {
    return await this.repo.find({
      where: {
        type: EventType.EXCEPTION,
        startDate: Raw(
          alias =>
            `${alias} >= '${date} 00:00:00' AND ${alias} <= '${date} 23:59:59'`,
        ),
      },
    });
  }

  /**
   * Get Events
   */
  async getEventsPaginated(skip = 0, take = 500): Promise<Event[]> {
    const events = await this.repo.find({
      relations: [
        'funnel',
        'funnel.lead',
        'funnel.lead.dealerDealership',
        'funnel.lead.dealerDealership.dealerCity',
        'funnel.lead.dealerDealership.dealerCity.dealerGroup',
        'model',
      ],
      skip,
      take,
    });
    return events;
  }

  /**
   * Search Events
   * @param searchEventsData Data for filters
   */
  async searchEvents(searchEventsData: SearchEventsData) {
    // To apply filters first I create the WHERE condition
    const where: FindConditions<Event> = {};
    // If the condition is on the Events table, I just add it directly to WHERE condition
    if (searchEventsData.from) {
      const fromDate = moment(searchEventsData.from);
      where.startDate = MoreThan(`${fromDate.format('YYYY-MM-DD')}T00:00:00`);
    }
    if (searchEventsData.to) {
      const toDate = moment(searchEventsData.to);
      where.endDate = LessThan(`${toDate.format('YYYY-MM-DD')}T23:59:59`);
    }
    if (searchEventsData.status) where.status = searchEventsData.status;
    if (searchEventsData.date) where.startDate = searchEventsData.date;
    if (searchEventsData.expert) where.userId = searchEventsData.expert;
    if (searchEventsData.type) where.type = searchEventsData.type;

    let searchQuery = this.repo
      .createQueryBuilder('e')
      .innerJoinAndSelect('e.funnel', 'f')
      .innerJoinAndSelect('f.lead', 'l')
      .innerJoinAndSelect('l.model', 'm')
      .innerJoinAndSelect('l.dealerDealership', 'dd')
      .innerJoinAndSelect('dd.dealerCity', 'dc')
      .innerJoinAndSelect('dc.dealerGroup', 'dg')
      .where(where);

    // But if the condition is on a third party table, I add the condition in AndWhere field
    if (searchEventsData.dealerGroup)
      searchQuery = searchQuery.andWhere(
        `dg.id = ${searchEventsData.dealerGroup}`,
      );
    if (searchEventsData.funnelId)
      searchQuery = searchQuery.andWhere(`f.id = ${searchEventsData.funnelId}`);
    if (searchEventsData.model)
      searchQuery = searchQuery.andWhere(
        `m.model = '${searchEventsData.model}'`,
      );

    // When all filters were applied I just call the Query statement.
    const events = await searchQuery.getMany();

    /*
      The Elastic events had an specific structure.
      So, when I have all the events, I map them in order to have
      the Elastic data structure.
    */
    const mysqlEvents = await this.parseMySQLDataToElasticStructure(events);

    return mysqlEvents;
    // return elasticEvents;
  }

  /**
   * Schedule Event depending on instance
   * @param scheduleEventData Event Data
   */
  async scheduleEvent(scheduleEventData: ScheduleEventData) {
    const instanceSlug = scheduleEventData.instance;

    await this.validateEvent(scheduleEventData);

    // local instance
    if (instanceSlug === this.instanceSlug) {
      delete scheduleEventData.instance;
      let event = this.repo.create(scheduleEventData);
      event.startDate = new Date(event.startDate);
      event.endDate = new Date(event.endDate);
      event = await this.repo.save(event);
      const funnel = await this.funnelsService.getFunnelWithLeadAndEvents(
        event.funnel.id,
      );

      // Update on Elastic
      /*
      try {
        await this.searchService.indexLeadFunnel(funnel);
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.log(
          `ES Error indexing Funnel: ${funnel.id} in ${this.instanceSlug}`,
        );
        throw new HttpException(
          'ES Error indexing Funnel',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      */
      return event;
    } else {
      const instance = await this.intancesService.findOne({
        where: { slug: instanceSlug },
      });

      if (instance) {
        const event = await this.intancesService.scheduleEvent(
          instance,
          scheduleEventData,
        );
        return event;
      } else {
        throw new HttpException('Instance not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  /**
   * Updates Scheduled Event depending on instance
   * @param updateScheduledEventData Event Data
   */
  async updateScheduledEvent(
    updateScheduledEventData: UpdateScheduledEventData,
  ) {
    const instanceSlug = updateScheduledEventData.instance;

    await this.validateEvent(updateScheduledEventData);

    // local instance
    if (instanceSlug === this.instanceSlug) {
      const eventId = updateScheduledEventData.id;
      delete updateScheduledEventData.instance;
      delete updateScheduledEventData.id;
      if (updateScheduledEventData.startDate) {
        updateScheduledEventData.startDate = new Date(
          updateScheduledEventData.startDate,
        );
      }
      if (updateScheduledEventData.endDate) {
        updateScheduledEventData.endDate = new Date(
          updateScheduledEventData.endDate,
        );
      }
      // Make null the NotInterestedReason field
      if (updateScheduledEventData.notInterestedReason === '') {
        updateScheduledEventData = {
          ...updateScheduledEventData,
          notInterestedReason: null,
        };
      }
      await this.repo.update(eventId, updateScheduledEventData);
      const event = await this.repo.findOne(eventId, {
        relations: ['funnel'],
      });
      const funnel = await this.funnelsService.getFunnelWithLeadAndEvents(
        event.funnel.id,
      );

      // Update on Elastic
      /*
      try {
        await this.searchService.updateLeadFunnel(funnel);
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.log(
          `ES Error updating Funnel: ${funnel.id} in ${this.instanceSlug}`,
        );
        throw new HttpException(
          'ES Error updating Funnel',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      */
      return event;
    } else {
      const instance = await this.intancesService.findOne({
        where: { slug: instanceSlug },
      });

      if (instance) {
        const event = await this.intancesService.updateScheduledEvent(
          instance,
          updateScheduledEventData,
        );
        return event;
      } else {
        throw new HttpException('Instance not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  /**
   * Return event data with funnel data and model
   * @param eventId Event Id
   */
  async getEventBydIdWithFunnelData(eventId: number) {
    return await this.repo.findOne(eventId, {
      relations: [
        'funnel',
        'funnel.lead',
        'funnel.lead.dealerDealership',
        'funnel.lead.dealerDealership.dealerCity',
        'funnel.lead.dealerDealership.dealerCity.dealerGroup',
        'model',
      ],
    });
  }

  async validateEvent(eventData: ScheduleEventData | UpdateScheduledEventData) {
    const date = new Date(eventData.startDate);
    const model = eventData.model.model;
    const userId = eventData.userId;
    const eventId = get(eventData, 'id', null);
    const funnelId = get(eventData, 'funnel.id', null);

    if (funnelId) {
      // search if an event exists for same model and date
      // TOD: Change to search in the database and comment Seraching in Elastic
      const activeFunnelEvents = await this.searchEvents({
        funnelId,
        status: EventStatus.ACTIVE,
      });

      // TOD: Change to search in the database and comment Seraching in Elastic
      const confirmedfunnelEvents = await this.searchEvents({
        funnelId,
        status: EventStatus.CONFIRMED,
      });

      if (activeFunnelEvents.length > 0 || confirmedfunnelEvents.length > 0) {
        throw new HttpException(
          'Ya existe evento para este lead',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // search if an event exists for same model and date
    // TOD: Change to search in the database and comment Seraching in Elastic
    let modelEvents = await this.searchEvents({
      model,
      date,
    });

    if (eventId) {
      modelEvents = modelEvents.filter(e => e.eventId !== eventId);
    }

    if (modelEvents.length > 0) {
      throw new HttpException(
        'Ya existen eventos para este modelo',
        HttpStatus.BAD_REQUEST,
      );
    }

    // search if an event exists for same expert and date
    // TOD: Change to search in the database and comment Seraching in Elastic
    let userEvents = await this.searchEvents({
      expert: userId,
      date,
    });

    if (eventId) {
      userEvents = userEvents.filter(e => e.eventId !== eventId);
    }

    if (userEvents.length > 0) {
      throw new HttpException(
        'Ya existen eventos en ese horario para el experto',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async downloadActiveEvents() {
    // TOD: Change to search in the database and comment Seraching in Elastic
    const events = await this.searchEvents({
      status: EventStatus.ACTIVE,
    });
    if (events.length > 0) {
      const filename = `active-events-${format(
        new Date(),
        'yyyy-MM-dd hh:mm:ss',
      )}.xlsx`;
      const fileLocation = `temp/${filename}`;
      const workbook = new Excel.stream.xlsx.WorkbookWriter({
        filename: fileLocation,
      });
      const worksheet = workbook.addWorksheet('Eventos Activos');
      worksheet.addRow([
        'country',
        'Nombres',
        'Apellidos',
        'Mobile o Email',
        'Modelo',
        'Fecha Inicio',
        'Fecha Fin',
      ]);

      for (const event of events) {
        worksheet.addRow([
          event.instance,
          event.names,
          event.lastNames,
          event.mobile || event.email,
          event.model,
          moment(event.eventStartDate).format('YYYY-MM-DD HH:mm:ss'),
          moment(event.eventEndDate).format('YYYY-MM-DD HH:mm:ss'),
        ]);
      }
      worksheet.commit();
      await workbook.commit();
      const fileDestination = `downloads/active-events-downloads/${filename}`;
      const filePath = `temp/${filename}`;
      const uploadResponse = await this.uploadsService.uploadAndGetPublicUrl(
        filePath,
        fileDestination,
      );

      return uploadResponse.publicURL;
    } else {
      return null;
    }
  }

  async parseMySQLDataToElasticStructure(events: Event[]) {
    return events.map(event => ({
      bouncedDate: event.funnel.bouncedDate
        ? `${event.funnel.bouncedDate}`
        : null,
      campaign: event.funnel.lead.campaignName,
      city: event.funnel.lead.city ? event.funnel.lead.city.name : null,
      clickDate: event.funnel.clickDate
        ? `${event.funnel.clickDate.toISOString()}`
        : null,
      clickOnCallUs: event.funnel.clickOnCallUs,
      clickOnCallUsDate: event.funnel.clickOnCallUsDate
        ? event.funnel.clickOnCallUsDate.toISOString()
        : null,
      clickOnFindUs: event.funnel.clickOnFindUs,
      clickOnFindUsDate: event.funnel.clickOnFindUsDate
        ? event.funnel.clickOnFindUsDate.toISOString()
        : null,
      clickOnHeader: event.funnel.clickOnHeader,
      clickOnHeaderDate: event.funnel.clickOnHeaderDate
        ? event.funnel.clickOnHeaderDate.toISOString()
        : null,
      clickOnModel: event.funnel.clickOnModel,
      clickOnModelDate: event.funnel.clickOnModelDate
        ? event.funnel.clickOnModelDate.toISOString()
        : null,
      clickOnWhatsapp: event.funnel.clickOnWhatsapp,
      clickOnWhatsappDate: event.funnel.clickOnWhatsappDate
        ? event.funnel.clickOnWhatsappDate.toISOString()
        : null,
      createdAt: event.funnel.createdAt
        ? `${new Date(event.funnel.createdAt.toString()).toISOString()}`
        : null,
      creationDate: event.funnel.lead.creationDate
        ? event.funnel.lead.creationDate.toISOString()
        : null,
      date: event.funnel.lead.date
        ? event.funnel.lead.date.toISOString()
        : null,
      dealerDealership: event.funnel.lead.dealerDealership.name,
      dealerGroup:
        event.funnel.lead.dealerDealership.dealerCity.dealerGroup.name,
      dealerGroupDerivedLink:
        event.funnel.lead.dealerDealership.dealerCity.dealerGroup.derivedLink,
      dealerGroupId:
        event.funnel.lead.dealerDealership.dealerCity.dealerGroup.id,
      document: event.funnel.lead.document,
      email: event.funnel.lead.email,
      emailSent: event.funnel.email,
      emailType: event.funnel.emailType,
      eventAppointmentFulfilled: event.appointmentFulfilled,
      eventBilled: event.billed,
      eventCancellationReason: event.cancellationReason,
      eventComments: event.comments,
      eventCreatedAt: event.createdAt
        ? `${new Date(event.createdAt.toString()).toISOString()}`
        : null,
      eventCreditApproved: event.creditApproved,
      eventCreditRequested: event.creditRequested,
      eventDerived: event.derived,
      eventDifferentIdSale: event.differentIdSale,
      eventEndDate: event.endDate ? event.endDate.toISOString() : null,
      eventEstimatedPurchaseDate: event.estimatedPurchaseDate
        ? event.estimatedPurchaseDate.toString()
        : null,
      eventExceptionReason: event.exceptionReason,
      eventFirstVehicle: event.firstVehicle,
      eventHasAnotherChevrolet: event.hasAnotherChevrolet,
      eventId: event.id,
      eventMoneyToBuy: parseInt(event.moneyToBuy.toString()),
      eventNotInterestedReason: event.notInterestedReason,
      eventOtherBrandConsidering: event.otherBrandConsidering,
      eventPurchasePostponed: event.purchasePostponed,
      eventQuoteAsked: event.quoteAsked,
      eventRequestedDate: event.requestedDate
        ? event.requestedDate.toISOString()
        : null,
      eventRequiresFinancing: event.requiresFinancing,
      eventReservation: event.reservation,
      eventSaleStatus: event.saleStatus,
      eventSellerLastName: event.sellerLastName,
      eventSellerName: event.sellerName,
      eventStartDate: event.startDate ? event.startDate.toISOString() : null,
      eventStatus: event.status,
      eventTimesReagent: event.timesReagent,
      eventType: event.type,
      eventUserFullName: event.userFullName,
      eventUserId: event.userId,
      family: event.funnel.lead.model.family,
      funnelId: event.funnel.id,
      id: event.funnel.lead.id,
      instance: `${this.instanceSlug}`,
      inxaitDownloadAt: event.funnel.inxaitDownloadAt
        ? event.funnel.inxaitDownloadAt.toISOString()
        : null,
      isValid: event.funnel.lead.isValid,
      lastName1: event.funnel.lead.lastName1,
      lastName2: event.funnel.lead.lastName2,
      lastNames: event.funnel.lead.lastNames,
      mobile: event.funnel.lead.mobile,
      model: event.funnel.lead.model.model,
      modelId: event.funnel.lead.model.id,
      name1: event.funnel.lead.name1,
      name2: event.funnel.lead.name2,
      names: event.funnel.lead.names,
      openDate: event.funnel.openDate
        ? event.funnel.openDate.toISOString()
        : null,
      opportunityName: event.funnel.lead.opportunityName,
      phone: event.funnel.lead.phone,
      sendDate: event.funnel.sendDate
        ? event.funnel.sendDate.toISOString()
        : null,
      smsSent: event.funnel.sms,
      source: event.funnel.lead.source,
      sourcedLeadId: null,
      status: event.funnel.lead.status,
      vin: event.funnel.lead.vin,
      workPhone: event.funnel.lead.workPhone,
    }));
  }
}

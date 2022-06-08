import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Funnel, LeadTypes } from './funnel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection, Brackets, Not, IsNull } from 'typeorm';
import { UtilitiesService } from 'modules/utilities/utilities.service';
import { getXlsxStream } from 'xlstream';
import { format, differenceInDays } from 'date-fns';
import * as Excel from 'exceljs';
import { UploadsService } from 'modules/uploads/uploads.service';
import { Lead } from 'modules/leads/lead.entity';
import { SourcedLead } from 'modules/leads/sourcedLead.entity';
import { Url } from 'url';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
// import { SearchService } from 'modules/elasticsearch/elasticsearch.service';
import moment = require('moment');
import { InstancesService } from 'modules/instances/instances.service';
import { Event } from '../events/event.entity';
import { SearchEventsData } from '../events/dto/SearchEventsData.dto';

@Injectable()
export class FunnelsService extends TypeOrmCrudService<Funnel> {
  private instanceSlug;
  constructor(
    @InjectRepository(Funnel) public repo: Repository<Funnel>,
    @InjectRepository(Event) public eventRepo: Repository<Event>,
    private utilities: UtilitiesService,
    private uploadsService: UploadsService,
    private configService: ConfigService,
    // private searchService: SearchService,
    private intancesService: InstancesService,
  ) {
    super(repo);
    this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
  }

  async downloadFunnels() {
    // const funnels = await this.searchService.searchLeadFunnelToDownload();
    let funnels = await this.searchLeadFunnelToDownload();
    if (funnels.length > 0) {
      // Remove duplicates in 30 days
      const purgedFunnels: {
        creationDate: string;
        email: string;
        funnelId: number;
        id: number;
        instance: string;
        lastNames: string;
        mobile: string;
        model: string;
        names: string;
        opportunityName: string;
        phone: string;
      }[] = [];
      funnels.map(funnel => {
        let groupedFunnels = funnels.filter(f => f.mobile === funnel.mobile);
        if (groupedFunnels.length > 1) {
          groupedFunnels = groupedFunnels.reverse();
          const lastRecord = groupedFunnels[0];
          purgedFunnels.push(lastRecord);
          for (let j = 1; j < groupedFunnels.length; j++) {
            if (
              differenceInDays(
                new Date(lastRecord.creationDate),
                new Date(groupedFunnels[j].creationDate),
              ) > 30
            ) {
              purgedFunnels.push(groupedFunnels[j]);
            } else {
              purgedFunnels.push(lastRecord);
            }
          }
        } else {
          return purgedFunnels.push(funnel);
        }
      });
      funnels = [...new Set(purgedFunnels.filter(Boolean))]; // Remove undefined

      const filename = `livestore-leads-${format(
        new Date(),
        'yyyy-MM-dd hh:mm:ss',
      )}.xlsx`;
      const fileLocation = `temp/${filename}`;
      const workbook = new Excel.stream.xlsx.WorkbookWriter({
        filename: fileLocation,
      });
      const worksheet = workbook.addWorksheet('LiveStore leads');
      worksheet.addRow([
        'opp_name',
        'country',
        'Fecha creación Siebel',
        'Nombres',
        'Apellidos',
        'Mobile o Email',
        'Modelo',
      ]);
      const funnelsToUpdate = [];
      for (const funnel of funnels) {
        let phone = funnel.mobile;
        if (funnel.instance === 'co') {
          phone = funnel.mobile || funnel.phone;
        }
        worksheet.addRow([
          funnel.opportunityName,
          funnel.instance,
          funnel.creationDate
            ? moment(funnel.creationDate).format('YYYY-MM-DD HH:mm:ss')
            : '',
          funnel.names,
          funnel.lastNames,
          phone || funnel.email,
          funnel.model,
        ]);
        funnelsToUpdate.push({ id: funnel.id });
      }
      worksheet.commit();
      await workbook.commit();
      const fileDestination = `downloads/funnel-downloads/${filename}`;
      const filePath = `temp/${filename}`;
      const uploadResponse = await this.uploadsService.uploadAndGetPublicUrl(
        filePath,
        fileDestination,
      );

      // local instance
      const instanceFunnelIds = funnels
        .filter(f => f.instance === this.instanceSlug)
        .map(f => f.funnelId);
      await this.markFunnelsAsDownloaded(instanceFunnelIds);

      // external instances
      const instances = await this.intancesService.find();
      for await (const instance of instances) {
        const funnelIds = funnels
          .filter(f => f.instance === instance.slug)
          .map(f => f.funnelId);

        if (funnelIds.length > 0) {
          await this.intancesService.markFunnelsAsDownloaded(
            instance,
            funnelIds,
          );
        }
      }

      return uploadResponse.publicURL;
    } else {
      return null;
    }
  }

  async markFunnelsAsDownloaded(funnelIds: number[]) {
    const today = new Date();
    if (funnelIds.length > 0) {
      await this.repo.update(funnelIds, { inxaitDownloadAt: today });
      // await this.searchService.bulkUpdateLeadFunnel(funnelIds, {
      //   doc: { inxaitDownloadAt: today },
      // });
    }
  }

  /**
   * Updates Funnel Date into each instance and elastic
   */
  async funnelsToDatabaase(
    filePath: string,
    fileName: string,
  ): Promise<string | null> {
    let errors = [];
    let rowNumber = 0;
    const stream = await getXlsxStream({ filePath, sheet: 0 });

    const instances = await this.intancesService.find();
    const instancesSlugs = instances.map(i => i.slug);
    instancesSlugs.push(this.instanceSlug);
    const leadsByCountry = {};
    leadsByCountry[this.instanceSlug] = [];
    for (const instance of instances) {
      leadsByCountry[instance.slug] = [];
    }

    for await (const line of stream) {
      rowNumber += 1;
      if (rowNumber === 1) {
        continue;
      }

      if (!line.formatted.arr[1]) {
        errors.push({
          errors: ['country es requerido'],
          row: line.formatted.arr,
        });
      } else {
        if (instancesSlugs.indexOf(line.formatted.arr[1]) < 0) {
          errors.push({
            errors: ['country es inválido'],
            row: line.formatted.arr,
          });
        } else {
          leadsByCountry[line.formatted.arr[1]].push(line.formatted.arr);
        }
      }
    }

    // local instance
    const rowErrors = await this.validateFunnelRows(
      leadsByCountry[this.instanceSlug],
    );
    if (rowErrors.length > 0) {
      errors = [...errors, ...rowErrors];
    }

    // external instances
    for (const instance of instances) {
      if (leadsByCountry[instance.slug].length > 0) {
        // call to api
        const instanceRowErrors = await this.intancesService.validateFunnelRowsToUpload(
          instance,
          leadsByCountry[instance.slug],
        );
        if (instanceRowErrors.length > 0) {
          errors = [...errors, ...instanceRowErrors];
        }
      }
    }

    if (errors.length > 0) {
      const errorsFileDestination = `temp/errores-${fileName}`;
      await this.utilities.createErrorsFile(errorsFileDestination, errors, [
        'Fila',
        'Errores',
        'opp_name',
        'country',
        'SMS o email',
        'Enviado',
        'Apertura',
        'Click',
        'Bounced',
      ]);
      return errorsFileDestination;
    }

    // When there is no error, update the info for each funnel
    // local Instance
    if (leadsByCountry[this.instanceSlug].length > 0) {
      await this.updateFunnelRows(leadsByCountry[this.instanceSlug]);
    }

    // external instances
    for (const instance of instances) {
      if (leadsByCountry[instance.slug].length > 0) {
        // call to api
        await this.intancesService.updateFunnelRows(
          instance,
          leadsByCountry[instance.slug],
        );
      }
    }
  }

  /**
   * Validate Funnel Rows to Upload
   * @param rows Rows to Validate
   */
  async validateFunnelRows(rows): Promise<string[]> {
    const errors = [];
    for (const row of rows) {
      const opportunityName = row[0];
      const smsOrEmail = row[2];

      let sms = false;
      let email = false;

      if (smsOrEmail === '1') {
        sms = true;
        email = false;
      } else if (smsOrEmail === '0') {
        sms = false;
        email = true;
      }

      const rowErrors = [];
      const savedFunnel = await this.repo.findOne({
        opportunityName,
      });
      if (!savedFunnel) {
        rowErrors.push('No existe un registro con ese opp_name');
      }
      if (sms === undefined || email === undefined) {
        rowErrors.push('Sms o email debe ser 0 o 1');
      }

      if (rowErrors.length > 0) {
        errors.push({ errors: rowErrors, row });
      }
    }
    return errors;
  }

  /**
   * Update Funnel Data from rows
   */
  async updateFunnelRows(rows: string[][]): Promise<void> {
    for (const row of rows) {
      const funnelEntity = await this.createFunnelEntityFromRow(row);
      await this.repo.update(
        {
          opportunityName: funnelEntity.opportunityName,
        },
        {
          sms: funnelEntity.sms,
          email: funnelEntity.email,
          sendDate: funnelEntity.sendDate,
          openDate: funnelEntity.openDate,
          clickDate: funnelEntity.clickDate,
          bouncedDate: funnelEntity.bouncedDate,
        },
      );
      const funnel = await this.repo.findOne({
        opportunityName: funnelEntity.opportunityName,
      });
      if (funnel) {
        // await this.searchService.updateLeadFunnelInxaitData(funnel);
      }
    }
  }

  /**
   * Creates a Funnel Entity with data from row
   * @param row
   */
  async createFunnelEntityFromRow(row: string[]): Promise<Funnel> {
    const newFunnel = this.repo.create();
    newFunnel.opportunityName = row[0];
    if (`${row[2]}` === '1') {
      newFunnel.sms = true;
      newFunnel.email = false;
    } else if (`${row[2]}` === '0') {
      newFunnel.sms = false;
      newFunnel.email = true;
    }
    newFunnel.sendDate = this.utilities.parseDateString(row[3], true);
    newFunnel.openDate = this.utilities.parseDateString(row[4], true);
    newFunnel.clickDate = this.utilities.parseDateString(row[5], true);
    newFunnel.bouncedDate = this.utilities.parseDateString(row[6], true);
    return newFunnel;
  }

  async createFunnelFromLead(
    lead: Lead,
    opportunityName: string,
    emailType: string,
  ) {
    const newFunnel = new Funnel();
    newFunnel.lead = lead;
    newFunnel.opportunityName = opportunityName;
    newFunnel.emailType = emailType;
    return await this.repo.save(newFunnel);
  }
  async createFunnelFromSourcedLead(sourcedLead: SourcedLead) {
    const newFunnel = new Funnel();
    newFunnel.sourcedLead = sourcedLead;
    return await this.repo.save(newFunnel);
  }

  async updateLeadDataBySourcedLeadId(
    sourcedLead: SourcedLead,
    lead: Lead,
    emailType: LeadTypes,
  ): Promise<Funnel> {
    const funnel = await this.repo.findOne({
      where: { sourcedLead: sourcedLead.id },
    });
    await this.repo.update(funnel.id, {
      lead,
      opportunityName: lead.opportunityName,
      emailType,
    });
    return funnel;
  }

  async saveClick(type, crypted): Promise<Url> {
    const funnelId = await this.decrypt(crypted);

    const funnel = await this.repo.findOne(funnelId, {
      relations: [
        'lead',
        'lead.campaign',
        'lead.model',
        'lead.dealerDealership',
        'lead.dealerDealership.dealerCity',
        'lead.dealerDealership.dealerCity.dealerGroup',
        'sourcedLead',
        'sourcedLead.model',
        'sourcedLead.dealerDealership',
        'lead.city',
        'events',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
    if (!funnel) {
      throw new HttpException('An error ocurred', HttpStatus.BAD_REQUEST);
    }
    let lead = null;
    if (funnel.lead) {
      lead = funnel.lead;
    } else if (funnel.sourcedLead) {
      lead = funnel.sourcedLead;
    }

    const wamessage = encodeURI(
      'Necesito más información sobre ' +
        lead.model.family +
        ' y planes de financiamiento',
    );
    let url = null;
    switch (type) {
      case 'header':
        funnel.clickOnHeader = true;
        funnel.clickOnHeaderDate = new Date();
        await this.repo.save(funnel);
        url = lead.dealerDealership.whatsapp;
        break;
      case 'whatsapp':
        funnel.clickOnWhatsapp = true;
        funnel.clickOnWhatsappDate = new Date();
        await this.repo.save(funnel);
        url = lead.dealerDealership.whatsapp;
        break;
      case 'livestoreHeader':
        funnel.clickOnHeader = true;
        funnel.clickOnHeaderDate = new Date();
        await this.repo.save(funnel);
        if (this.instanceSlug === 'ec') {
          url = 'https://bit.ly/36SCLjx';
        }
        if (this.instanceSlug === 'co') {
          url = 'https://rb.gy/whnoeg';
        }
        break;
      case 'livestoreWhatsapp':
        funnel.clickOnWhatsapp = true;
        funnel.clickOnWhatsappDate = new Date();
        await this.repo.save(funnel);
        if (this.instanceSlug === 'ec') {
          url = 'https://bit.ly/36SCLjx';
        }
        if (this.instanceSlug === 'co') {
          url = 'https://rb.gy/whnoeg';
        }
        break;
      case 'callUs':
        funnel.clickOnCallUs = true;
        funnel.clickOnCallUsDate = new Date();
        await this.repo.save(funnel);
        url = 'tel:' + lead.dealerDealership.telephone;
        break;
      case 'location':
        funnel.clickOnFindUs = true;
        funnel.clickOnFindUsDate = new Date();
        await this.repo.save(funnel);
        url = lead.dealerDealership.urlLocation;
        break;
      case 'model':
        funnel.clickOnModel = true;
        funnel.clickOnModelDate = new Date();
        await this.repo.save(funnel);
        url = lead.model.url;
        break;
    }

    // Update on Elastic
    try {
      // await this.searchService.updateLeadFunnel(funnel);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.log(
        `Error updating ES Index of Funnel Id: ${funnel.id} in ${this.instanceSlug}`,
      );
    }

    return url;
  }

  async decrypt(text: string): Promise<number> {
    const algorithm = 'aes-256-cbc';
    // Defining key
    const key = 'cmiaernkteotuinnggrraedloascison';
    // Defininf iv
    const iv = 'semiafrteiftrams';

    const encryptedText = Buffer.from(text, 'hex');

    // Creating Decipher
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    // Updating encrypted text
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // returns data after decryption
    return parseInt(decrypted.toString());
  }

  async findOneByDocumentOrPhone(documentOrPhone): Promise<Funnel | null> {
    const query = getConnection()
      .getRepository(Funnel)
      .createQueryBuilder('f')
      .select('l.document', 'document')
      .addSelect('l.names', 'names')
      .addSelect('l.lastNames', 'lastNames')
      .addSelect('l.mobile', 'mobile')
      .addSelect('l.phone', 'phone')
      .addSelect('l.workPhone', 'workPhone')
      .addSelect('dd.name', 'dealer')
      .addSelect('m.model', 'model')
      .innerJoin('f.lead', 'l')
      .innerJoin('l.dealerDealership', 'dd')
      .leftJoin('l.model', 'm')
      .where('f.lead IS NOT NULL')
      .andWhere('f.emailType like :liveStore', {
        liveStore: LeadTypes.LIVE_STORE,
      });
    query.andWhere(
      new Brackets(qb => {
        qb.where(`l.document = ${documentOrPhone}`)
          .orWhere(`l.mobile = ${documentOrPhone}`)
          .orWhere(`l.phone = ${documentOrPhone}`)
          .orWhere(`l.workPhone = ${documentOrPhone}`);
      }),
    );
    const result = await query.orderBy('l.creationDate', 'DESC').getRawOne();

    if (result) {
      return result;
    }
    return null;
  }

  /**
   * Get Leads that have a funnel
   */
  async getLeadsWithFunnel(skip = 0, take = 500): Promise<Funnel[]> {
    const leads = await this.find({
      where: { lead: Not(IsNull()) },
      relations: [
        'lead',
        'lead.campaign',
        'lead.model',
        'lead.dealerDealership',
        'lead.dealerDealership.dealerCity',
        'lead.dealerDealership.dealerCity.dealerGroup',
        'lead.city',
        'events',
      ],
      skip,
      take,
    });
    return leads;
  }

  /**
   * Return funnel with lead and event
   * @param funnelId Funnel Id
   */
  async getFunnelWithLeadAndEvents(funnelId) {
    return await this.repo.findOne(funnelId, {
      relations: [
        'lead',
        'lead.campaign',
        'lead.model',
        'lead.dealerDealership',
        'lead.dealerDealership.dealerCity',
        'lead.dealerDealership.dealerCity.dealerGroup',
        'lead.city',
        'events',
      ],
    });
  }

  async searchEvents(
    searchEventsData: SearchEventsData,
    wantOneByDocumentOfPhone = false,
  ) {
    let searchQuery = this.repo
      .createQueryBuilder('f')
      .innerJoinAndSelect('f.lead', 'l')
      .innerJoinAndSelect('l.model', 'm')
      .innerJoinAndSelect('l.dealerDealership', 'dd')
      .innerJoinAndSelect('dd.dealerCity', 'dc')
      .innerJoinAndSelect('dc.dealerGroup', 'dg');

    if (wantOneByDocumentOfPhone) {
      if (searchEventsData.derived) {
        let toSearchDerived = true;
        if (searchEventsData.derived === 0) toSearchDerived = false;
        searchQuery = searchQuery
          .innerJoinAndSelect('f.events', 'e')
          .andWhere(`e.derived = ${toSearchDerived}`);
      }
      if (!searchEventsData.dealerGroup) {
        searchQuery = searchQuery.andWhere(
          `l.creationDate >= (NOW() - INTERVAL 120 DAY)`,
        );
        searchQuery = searchQuery.orderBy('l.creationDate', 'ASC');
      }
      if (searchEventsData.documentOrPhone) {
        searchQuery.andWhere(
          new Brackets(qb => {
            qb.where(`l.document = ${searchEventsData.documentOrPhone}`)
              .orWhere(`l.mobile = ${searchEventsData.documentOrPhone}`)
              .orWhere(`l.phone = ${searchEventsData.documentOrPhone}`)
              .orWhere(`l.workPhone = ${searchEventsData.documentOrPhone}`);
          }),
        );
      }
    }

    // When all filters were applied I just call the Query statement.
    const funnels = await searchQuery.getMany();

    /*
      The Elastic events had an specific structure.
      So, when I have all the events, I map them in order to have
      the Elastic data structure.
    */
    const mysqlEvents = await this.parseEventsMySQLDataToElasticStructure(
      funnels,
    );

    // return mysqlEvents;
    return mysqlEvents;
  }

  async parseEventsMySQLDataToElasticStructure(funnels: Funnel[]) {
    return funnels.map(funnel => ({
      bouncedDate: funnel.bouncedDate ? `${funnel.bouncedDate}` : null,
      campaign: funnel.lead.campaignName,
      city: funnel.lead.city ? funnel.lead.city.name : null,
      clickDate: funnel.clickDate ? `${funnel.clickDate.toISOString()}` : null,
      clickOnCallUs: funnel.clickOnCallUs,
      clickOnCallUsDate: funnel.clickOnCallUsDate
        ? funnel.clickOnCallUsDate.toISOString()
        : null,
      clickOnFindUs: funnel.clickOnFindUs,
      clickOnFindUsDate: funnel.clickOnFindUsDate
        ? funnel.clickOnFindUsDate.toISOString()
        : null,
      clickOnHeader: funnel.clickOnHeader,
      clickOnHeaderDate: funnel.clickOnHeaderDate
        ? funnel.clickOnHeaderDate.toISOString()
        : null,
      clickOnModel: funnel.clickOnModel,
      clickOnModelDate: funnel.clickOnModelDate
        ? funnel.clickOnModelDate.toISOString()
        : null,
      clickOnWhatsapp: funnel.clickOnWhatsapp,
      clickOnWhatsappDate: funnel.clickOnWhatsappDate
        ? funnel.clickOnWhatsappDate.toISOString()
        : null,
      createdAt: funnel.createdAt
        ? `${new Date(funnel.createdAt.toString()).toISOString()}`
        : null,
      creationDate: funnel.lead.creationDate
        ? funnel.lead.creationDate.toISOString()
        : null,
      date: funnel.lead.date ? funnel.lead.date.toISOString() : null,
      dealerDealership: funnel.lead.dealerDealership.name,
      dealerGroup: funnel.lead.dealerDealership.dealerCity.dealerGroup.name,
      dealerGroupDerivedLink:
        funnel.lead.dealerDealership.dealerCity.dealerGroup.derivedLink,
      dealerGroupId: funnel.lead.dealerDealership.dealerCity.dealerGroup.id,
      document: funnel.lead.document,
      email: funnel.lead.email,
      emailSent: funnel.email,
      emailType: funnel.emailType,
      // eventAppointmentFulfilled: (await funnel.events).map(
      //   event => event.saleStatus,
      // ),
      eventBilled: funnel.events ? funnel.events[0].billed : null,
      eventCancellationReason: funnel.events
        ? funnel.events[0].cancellationReason
        : null,
      eventComments: funnel.events ? funnel.events[0].comments : null,
      eventCreatedAt: funnel.events
        ? funnel.events[0].createdAt
          ? `${new Date(funnel.events[0].createdAt.toString()).toISOString()}`
          : null
        : null,
      eventCreditApproved: funnel.events
        ? funnel.events[0].creditApproved
        : null,
      eventCreditRequested: funnel.events
        ? funnel.events[0].creditRequested
        : null,
      eventDerived: funnel.events ? funnel.events[0].derived : null,
      eventDifferentIdSale: funnel.events
        ? funnel.events[0].differentIdSale
        : null,
      eventEndDate: funnel.events
        ? funnel.events[0].endDate
          ? funnel.events
            ? funnel.events[0].endDate.toISOString()
            : null
          : null
        : null,
      eventEstimatedPurchaseDate: funnel.events
        ? funnel.events[0].estimatedPurchaseDate
          ? funnel.events
            ? funnel.events[0].estimatedPurchaseDate.toString()
            : null
          : null
        : null,
      eventExceptionReason: funnel.events
        ? funnel.events[0].exceptionReason
        : null,
      eventFirstVehicle: funnel.events ? funnel.events[0].firstVehicle : null,
      eventHasAnotherChevrolet: funnel.events
        ? funnel.events[0].hasAnotherChevrolet
        : null,
      eventId: funnel.events ? funnel.events[0].id : null,
      eventMoneyToBuy: funnel.events
        ? parseInt(funnel.events[0].moneyToBuy.toString())
        : null,
      eventNotInterestedReason: funnel.events
        ? funnel.events[0].notInterestedReason
        : null,
      eventOtherBrandConsidering: funnel.events
        ? funnel.events[0].otherBrandConsidering
        : null,
      eventPurchasePostponed: funnel.events
        ? funnel.events[0].purchasePostponed
        : null,
      eventQuoteAsked: funnel.events ? funnel.events[0].quoteAsked : null,
      eventRequestedDate: funnel.events
        ? funnel.events[0].requestedDate
          ? funnel.events
            ? funnel.events[0].requestedDate.toISOString()
            : null
          : null
        : null,
      eventRequiresFinancing: funnel.events
        ? funnel.events[0].requiresFinancing
        : null,
      eventReservation: funnel.events ? funnel.events[0].reservation : null,
      eventSaleStatus: funnel.events ? funnel.events[0].saleStatus : null,
      eventSellerLastName: funnel.events
        ? funnel.events[0].sellerLastName
        : null,
      eventSellerName: funnel.events ? funnel.events[0].sellerName : null,
      eventStartDate: funnel.events
        ? funnel.events[0].startDate
          ? funnel.events
            ? funnel.events[0].startDate.toISOString()
            : null
          : null
        : null,
      eventStatus: funnel.events ? funnel.events[0].status : null,
      eventTimesReagent: funnel.events ? funnel.events[0].timesReagent : null,
      eventType: funnel.events ? funnel.events[0].type : null,
      eventUserFullName: funnel.events ? funnel.events[0].userFullName : null,
      eventUserId: funnel.events ? funnel.events[0].userId : null,
      family: funnel.lead.model.family,
      funnelId: funnel.id,
      id: funnel.lead.id,
      instance: `${this.instanceSlug}`,
      inxaitDownloadAt: funnel.inxaitDownloadAt
        ? funnel.inxaitDownloadAt.toISOString()
        : null,
      isValid: funnel.lead.isValid,
      lastName1: funnel.lead.lastName1,
      lastName2: funnel.lead.lastName2,
      lastNames: funnel.lead.lastNames,
      mobile: funnel.lead.mobile,
      model: funnel.lead.model.model,
      modelId: funnel.lead.model.id,
      name1: funnel.lead.name1,
      name2: funnel.lead.name2,
      names: funnel.lead.names,
      openDate: funnel.openDate ? funnel.openDate.toISOString() : null,
      opportunityName: funnel.lead.opportunityName,
      phone: funnel.lead.phone,
      sendDate: funnel.sendDate ? funnel.sendDate.toISOString() : null,
      smsSent: funnel.sms,
      source: funnel.lead.source,
      sourcedLeadId: null,
      status: funnel.lead.status,
      vin: funnel.lead.vin,
      workPhone: funnel.lead.workPhone,
    }));
  }

  async parseFunnelMySQLDataToElasticStructure(funnels: Funnel[]) {
    return funnels.map(funnel => {
      return {
        creationDate: funnel.lead.creationDate
          ? funnel.lead.creationDate.toISOString()
          : null,
        email: funnel.lead.email,
        funnelId: funnel.id,
        id: funnel.lead.id,
        instance: `${this.instanceSlug}`,
        lastNames: funnel.lead.lastNames,
        mobile: funnel.lead.mobile,
        model: funnel.lead.model.model,
        names: funnel.lead.names,
        opportunityName: funnel.lead.opportunityName,
        phone: funnel.lead.phone,
      };
    });
  }

  async findOneFunnelByDocumentOrPhone(
    documentOrPhone: string,
    dealerGroup: number | null = null,
    derived: number = null,
  ) {
    const events = await this.searchEvents(
      {
        documentOrPhone,
        dealerGroup,
        derived,
      },
      true,
    );
    if (events[0]) {
      return [events[0]];
    } else {
      return [];
    }
  }

  async searchLeadFunnelToDownload() {
    let searchQuery = this.repo
      .createQueryBuilder('f')
      .innerJoinAndSelect('f.lead', 'l')
      .innerJoinAndSelect('l.model', 'm');

    searchQuery = searchQuery.andWhere(`f.emailType LIKE 'live_store'`);
    searchQuery = searchQuery.andWhere(`f.inxaitDownloadAt IS NULL`);
    searchQuery = searchQuery.orderBy('f.createdAt', 'ASC');

    // When all filters were applied I just call the Query statement.
    const funnels = await searchQuery.getMany();

    /*
      The Elastic events had an specific structure.
      So, when I have all the events, I map them in order to have
      the Elastic data structure.
    */
    const mysqlFunnels = await this.parseFunnelMySQLDataToElasticStructure(
      funnels,
    );

    return mysqlFunnels;
  }
}

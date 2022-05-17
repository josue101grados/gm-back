import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Brackets, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CampaignsService } from 'modules/campaigns/campaigns.service';
import { CitiesService } from 'modules/cities/cities.service';
import { DealerDealershipsService } from 'modules/dealers/dealerDealerships.service';
import { EmailsService } from 'modules/emails/emails.service';
import { EstimatedPurchaseDateAliasesService } from 'modules/estimatedPurchaseDateAliases/estimatedPurchaseDateAliases.service';
import { ModelsService } from 'modules/models/models.service';
import { SourcedLeadsService } from './sourcedLeads.service';
import {
  UtilitiesService,
  PhoneTypes,
  Row,
  ValidationError,
} from 'modules/utilities/utilities.service';
import { Campaign } from 'modules/campaigns/campaign.entity';
import { Lead, LeadStatus } from './lead.entity';
import { Sale } from 'modules/sales/sale.entity';
import { SourcedLead } from './sourcedLead.entity';
import { getXlsxStream } from 'xlstream';
import { clone, trim } from 'lodash';
import { DealerGroup } from 'modules/dealers/dealerGroup.entity';
import moment = require('moment-timezone');
import { FunnelsService } from 'modules/funnels/funnels.service';
// import { SearchService } from 'modules/elasticsearch/elasticsearch.service';
import { endOfDay, add, setDay, format, endOfMonth, parse } from 'date-fns';
import { LeadTypes } from 'modules/funnels/funnel.entity';
import { EmailTypes } from 'modules/models/model.entity';
import { CreateExceptionDto } from '../exceptions/dto/exceptions.dto';
import { ExceptionsService } from '../exceptions/exceptions.service';

@Injectable()
export class LeadsService extends TypeOrmCrudService<Lead> {
  private readonly logger = new Logger(LeadsService.name);
  private instanceSlug;

  constructor(
    @InjectRepository(Lead) repo,
    // @InjectRepository(Exception)
    // private exceptionRepo: Repository<Exception>,
    private configService: ConfigService,
    private campaignsService: CampaignsService,
    private citiesService: CitiesService,
    private dealersDealershipsService: DealerDealershipsService,
    private emailsService: EmailsService,
    private estimatedPurchaseDateAliasesService: EstimatedPurchaseDateAliasesService,
    private modelsService: ModelsService,
    // private searchService: SearchService,
    @Inject(forwardRef(() => SourcedLeadsService))
    private sourcedLeadsService: SourcedLeadsService,
    private utilitiesService: UtilitiesService,
    private funnelsService: FunnelsService,
    private exceptionsService: ExceptionsService,
  ) {
    super(repo);
    this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
  }

  async validateRow(row: Row): Promise<string[]> {
    const rowErrors: string[] = [];
    const [
      A,
      B,
      C,
      D,
      E,
      F,
      G,
      H,
      I,
      J,
      campaignName, // K
      L,
      M,
      N,
      O,
      dealerDealershipName, // P
      Q,
      R,
      S,
      creationDate, // T
      U,
      V,
      W,
      X,
      Y,
      Z,
      AA,
      AB,
      modelName, // AC
      AD,
      AE,
      AF,
      AG,
      AH,
      AI,
      AJ,
      AK,
      AL,
      AM,
      AN,
      AO,
      AP,
      AQ,
      AR,
      AS,
      AT,
      AU,
      email, // AV
      AW,
      phone, // AX
      mobile, // AY
      workPhone, // AZ
      BA,
      bac, // BB
      BC,
      BD,
      BE,
      opportunityName, // BF
      saleStageDate, // BG
      BH,
      BI,
      BJ,
      BK,
      BL,
      BM,
      BN,
      BO,
      BP,
      BQ,
      BR,
      BS,
      BT,
      BU,
      BV,
      leadType, // BW
      BX,
      BY,
      BZ,
      CA,
      lastNames, // CB
      CC,
      estimatedPurchaseDate, // CD
      CE,
      CF,
      document, // CG
      names, // CH
      CI,
      CJ,
      CK,
      CL,
      CM,
      CN,
      saleStage, // CO
      CP,
      CQ,
      CR,
      CS,
    ] = row;
    if (leadType !== 'Venta Vehículos Nuevos') {
      return [];
    }
    let dealerDealership = await this.dealersDealershipsService.findByBac(bac);
    // If the campaignName and dealerDealershipName matches this values, try to find the BAC inside comments
    if (
      campaignName === 'GMEC LiveStore' &&
      dealerDealershipName === 'DIRECT SALES ECUADOR'
    ) {
      try {
        const bacStartingIndex = estimatedPurchaseDate.search(/\d{6}/i);
        const bacFromComments = estimatedPurchaseDate.slice(
          bacStartingIndex,
          bacStartingIndex + 6,
        );
        dealerDealership = await this.dealersDealershipsService.findByBac(
          bacFromComments,
        );
      } catch (e) {
        // Unable to find the value, just continue
      }
    }
    if (
      dealerDealership &&
      dealerDealership.dealerCity &&
      dealerDealership.dealerCity.ignore
    ) {
      // don't upload dealer ignored
      return [];
    }
    try {
      if (
        this.utilitiesService.parseDateString(creationDate).toString() ===
        'Invalid Date'
      ) {
        rowErrors.push(
          'Fecha de creación debe estar en el formato mes/día/año',
        );
      }
      if (
        this.utilitiesService.parseDateString(saleStageDate).toString() ===
        'Invalid Date'
      ) {
        rowErrors.push(
          'Fecha de la etapa de ventas debe estar en el formato mes/día/año.',
        );
      }
      const cleanedCampaignName = this.utilitiesService.cleanSpaceSpecialCharacter(
        campaignName,
      );
      const campaign = await this.campaignsService.findByNameOrAlias(
        cleanedCampaignName,
      );
      if (!campaign) {
        rowErrors.push(
          'Nombre de la campaña no coincide con ningún valor registrado.',
        );
      }
      if (!saleStage) {
        rowErrors.push('Ingrese un valor en Etapa de venta');
      }
      if (!opportunityName) {
        rowErrors.push('Ingrese un valor en ID de la oportunidad');
      }
      if (!dealerDealership) {
        rowErrors.push(
          'Distribuidor orginal Código BAC y Distribuidor no coinciden con ningún valor registrado.',
        );
      } else {
        if (!dealerDealership.dealerCity) {
          rowErrors.push(
            'Se encontró el Dealer pero no tiene un Dealer por ciudad asignado',
          );
        }
      }
      if (!names) {
        rowErrors.push('Ingrese un valor en Nombre del contacto');
      }
      if (!lastNames) {
        rowErrors.push('Ingrese un valor en Apellidos del contacto');
      }
      const model = await this.modelsService.findByNameOrAlias(modelName);
      if (!model) {
        rowErrors.push('Modelo no coincide con ningún valor registrado.');
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return ['Error de formato con toda la línea'];
    }
    return rowErrors;
  }

  async createFromRow(row: Row) {
    const [
      A,
      B,
      C,
      D,
      E,
      F,
      G,
      H,
      I,
      J,
      campaignName, // K
      L,
      M,
      siebelDate, // N
      O,
      dealerDealershipName, // P
      Q,
      R,
      S,
      creationDate, // T
      U,
      V,
      W,
      X,
      Y,
      Z,
      AA,
      AB,
      modelName, // AC
      AD,
      AE,
      AF,
      AG,
      AH,
      AI,
      AJ,
      AK,
      AL,
      AM,
      AN,
      AO,
      AP,
      AQ,
      AR,
      AS,
      AT,
      AU,
      email, // AV
      AW,
      phone, // AX
      mobile, // AY
      workPhone, // AZ
      BA,
      bac, // BB
      BC,
      BD,
      BE,
      opportunityName, // BF
      saleStageDate, // BG
      BH,
      BI,
      BJ,
      BK,
      BL,
      BM,
      BN,
      BO,
      BP,
      BQ,
      BR,
      BS,
      BT,
      BU,
      BV,
      leadType, // BW
      BX,
      BY,
      BZ,
      CA,
      lastNames, // CB
      CC,
      estimatedPurchaseDate, // CD
      CE,
      CF,
      document, // CG
      names, // CH
      CI,
      CJ,
      CK,
      CL,
      CM,
      CN,
      saleStage, // CO
      CP,
      CQ,
      CR,
      CS,
    ] = row;
    if (leadType !== 'Venta Vehículos Nuevos') {
      return;
    }

    const newLead = this.repo.create();
    newLead.isNewVehicleSale = true;
    const parsedCreationDate = this.utilitiesService.parseDateString(
      creationDate,
    );

    newLead.bac = bac;
    newLead.dealerDealershipName = dealerDealershipName;
    newLead.dealerDealership = await this.dealersDealershipsService.findByBac(
      bac,
    );

    const estimatedPurchaseDateArray = {
      '1 MES': [
        'Fecha estimada de compra = 1 Mes',
        'Fecha Estimada de Compra: 1 mes',
        'Fecha estimada de compra: 1 mes',
        'Fecha estimada de compras: 1 mes',
        'Purchase Horizon = 1 Mes',
        'Fecha Estimada de Compra:  1 mes ',
        'Fecha Estimada de Compra:  1 mes',
        'Fecha estimada de compra = 1 mes',
        'FECHA ESTIMADA DE COMPRA: 1 mes;',
        'FECHA ESTIMADA DE COMPRA: 1 mes',
        'Fecha Estimada de Compra: 1 Mes ',
        'Fecha Estimada de Compra: 1 Mes',
        'Fecha Estimada de Compra: 1 Mes |',
      ],
      '2 MESES': [
        'Fecha estimada de compra = 2 Meses',
        'Fecha Estimada de Compra: 2 meses',
        'Fecha estimada de compras: 2 meses',
        'Fecha estimada de compra: 2 meses',
        'Purchase Horizon = 2 Meses',
        'Fecha Estimada de Compra:  2 meses ',
        'Fecha Estimada de Compra:  2 meses',
        'Fecha estimada de compra = 2 meses',
        'FECHA ESTIMADA DE COMPRA: 2 meses;',
        'FECHA ESTIMADA DE COMPRA: 2 meses',
        'Fecha Estimada de Compra: 2 Meses ',
        'Fecha Estimada de Compra: 2 Meses',
      ],
      '3 MESES': [
        'Fecha estimada de compras: 3 meses',
        'Fecha estimada de compra = 3 Meses',
        'Fecha Estimada de Compra: 3 meses',
        'Fecha estimada de compra: 3 meses',
        'Purchase Horizon = 3 Meses',
        'Fecha estimada de compra = 3 meses',
        'Fecha Estimada de Compra: 3 Meses ',
        'Fecha Estimada de Compra: 3 Meses',
      ],
      '> 3 MESES': [
        'Fecha estimada de compra = Más de 3 Meses',
        'Fecha Estimada de Compra: MÃ¡s de 3 meses',
        'Fecha estimada de compra: más de 3 meses',
        'Fecha estimada de compras: Más de 3 meses',
        'Fecha estimada de compra: Más de 3 meses',
        'Purchase Horizon = Más de 3 Meses',
        'Fecha estimada de compra = Más de 3 meses',
        'Fecha Estimada de Compra: Más de 3 meses ',
        'Fecha Estimada de Compra: Más de 3 meses',
      ],
    };

    // Don't upload to Lead's Table the dealer ignored
    if (newLead.dealerDealership.dealerCity.ignore) {
      // Also there are some dealer BAC's that have to be ignored based on the country
      const currentBAC = newLead.dealerDealership.bac;
      if (this.instanceSlug === 'co') {
        if (currentBAC === `267438`) return; // TEST COLOMBIA
      }
      if (this.instanceSlug === 'ec') {
        if (currentBAC === `150212`) return; // TEST ECUADOR
      }
      if (this.instanceSlug === 'cl') {
        if (currentBAC === `267336`) return; // TEST CHILE
      }
      if (this.instanceSlug === 'pe') {
        if (currentBAC === `281740`) return; //TEST PERU
      }

      // The dealer ignored has to be created on the Exception's table
      let estimatedPurchaseDateDto = '';
      let normalizedEstimatedPurchaseDateDto = '';

      if (estimatedPurchaseDate) {
        for (const [key, resultArray] of Object.entries(
          estimatedPurchaseDateArray,
        )) {
          for (const alias of resultArray) {
            const n = estimatedPurchaseDate.indexOf(alias);
            if (n !== -1) {
              estimatedPurchaseDateDto = alias;
              normalizedEstimatedPurchaseDateDto = key;
            }
          }
        }
      }
      const parsedSiebelDate = this.utilitiesService.parseDateString(
        siebelDate,
      );

      const model = await this.modelsService.findByNameOrAlias(modelName);
      const newException: CreateExceptionDto = {
        opportunityName,
        derivationDate: parsedCreationDate,
        siebelDate: parsedSiebelDate,
        estimatedPurchaseDate: estimatedPurchaseDateDto,
        normalizedEstimatedPurchaseDate: normalizedEstimatedPurchaseDateDto,
        modelId: model ? model.id : null,
        isFiltered: true,
        campaignName: this.utilitiesService.cleanSpaceSpecialCharacter(
          campaignName,
        ),
        document: document ? String(document) : null,
        names: names ? String(names) : null,
        lastNames: lastNames ? String(lastNames) : null,
        mobile: mobile ? String(mobile) : null,
        phone: phone ? String(phone) : null,
        workPhone: workPhone ? String(workPhone) : null,
        email,
      };
      await this.exceptionsService.createException(newException);
      return;
    }

    const cleanedCampaignName = this.utilitiesService.cleanSpaceSpecialCharacter(
      campaignName,
    );

    /*
      If you want to update something of the estimatedPurchaseDateArray algorithm
      ALSO you have to change it above on the newException create
    */
    if (estimatedPurchaseDate) {
      newLead.rawClientComment = estimatedPurchaseDate;
      for (const [key, resultArray] of Object.entries(
        estimatedPurchaseDateArray,
      )) {
        for (const alias of resultArray) {
          const n = estimatedPurchaseDate.indexOf(alias);
          if (n !== -1) {
            newLead.estimatedPurchaseDate = alias;
            newLead.normalizedEstimatedPurchaseDate = key;
          }
        }
      }
    }

    newLead.creationDate = parsedCreationDate;
    newLead.date = parsedCreationDate;
    newLead.saleStageDate = this.utilitiesService.parseDateString(
      saleStageDate,
    );
    newLead.campaignName = cleanedCampaignName;
    newLead.campaign = await this.campaignsService.findByNameOrAlias(
      cleanedCampaignName,
    );
    newLead.source = newLead.campaign.source;
    newLead.saleStage = saleStage;
    newLead.opportunityName = opportunityName;
    newLead.document = document ? String(document) : null;
    this.validateDocument(newLead);

    // ignore documents empty or with 0
    if (
      !newLead.document ||
      newLead.document === '0' ||
      newLead.document === ''
    ) {
      newLead.isValid = false;
    }

    newLead.names = names ? String(names) : null;
    newLead.lastNames = lastNames ? String(lastNames) : null;
    newLead.mobile = mobile ? String(mobile) : null;
    newLead.phone = phone ? String(phone) : null;
    newLead.workPhone = workPhone ? String(workPhone) : null;
    newLead.email = email;
    newLead.modelName = modelName;
    newLead.model = await this.modelsService.findByNameOrAlias(modelName);

    const updated = await this.updateExistingLead(newLead);
    if (updated) {
      return;
    }

    let canCreate = true;
    const lastLeadImported = await this.getLastImportedLeadDate(
      newLead.campaign,
    );

    // Verify that lead date is after the last lead imported
    if (lastLeadImported) {
      const lastLeadImportedDate = moment.tz(
        lastLeadImported,
        'America/Guayaquil',
      );

      const leadDate = moment.tz(newLead.creationDate, 'America/Guayaquil');
      if (leadDate.valueOf() < lastLeadImportedDate.valueOf()) {
        canCreate = false;
      }
    }

    if (canCreate) {
      // mark as invalid for campaigns and segments ignored
      if (
        newLead.campaign.ignore ||
        !newLead.model ||
        newLead.model.segment.ignore
      ) {
        newLead.isValid = false;
        newLead.status = LeadStatus.SIEBEL;
        await this.repo.save(newLead);
      } else {
        if (newLead.campaign.validateSelfDuplicates) {
          newLead.validateSelfCampaignDuplicates = true;
        }

        // this.validateTest(newLead);
        // if (newLead.status === LeadStatus.DISCARDED) {
        //   this.repo.save(newLead);
        //   return;
        // }

        await this.validatePhone(newLead);

        if (newLead.saleStage !== 'Cerrado-Vinculado') {
          await this.validateDuplicate(newLead);
        }

        this.validateDocument(newLead);
        await this.validateEmail(newLead);

        this.utilitiesService.normalizeNames(newLead);

        if (newLead.saleStage === 'Cerrado-Vinculado') {
          newLead.isValid = false;
          newLead.status = LeadStatus.DISCARDED;
        } else {
          await this.repo.save(newLead);
          // check if mail was send from sourced leads
          const fromDate = moment(newLead.creationDate)
            .subtract(32, 'days')
            .format('YYYY-MM-DD HH:mm:ss');
          // search a sourced leads that match to the lead to see if the mail was sended
          const sentAtNotNull = false;
          const sourcedLead = await this.sourcedLeadsService.findOneByEmailSentAtStatusAndDocument(
            fromDate,
            newLead.document,
            sentAtNotNull,
          );
          // assumpt that the mail was sended on sourced lead
          let sendEmail = false;
          // set emailType
          let emailType = LeadTypes.LIVE_STORE;
          if (
            newLead.model.emailType === 'first_contact' ||
            // if campaign is GMCO_GMF_Aprobados sin desembolsar and the email type is livestore, send first contact email
            (newLead.campaign.name === 'GMCO_GMF_Aprobados sin desembolsar' &&
              newLead.model.emailType === EmailTypes.LIVE_STORE)
          ) {
            emailType = LeadTypes.FIRST_CONTACT;
          }
          let funnel = null;
          // update funnel with soucer lead funnel
          if (sourcedLead) {
            if (sourcedLead.emailSentAt) {
              // update first contact/ live store email date
              newLead.emailSentAt = sourcedLead.emailSentAt;
              sendEmail = false;
            }
            // update Existing Funnel if creation date >= 29/06/2020
            if (
              moment(newLead.creationDate).format('YYYY-MM-DD') >=
                '2020-06-29' &&
              newLead.model.emailType &&
              newLead.isValid === true
            ) {
              funnel = await this.funnelsService.updateLeadDataBySourcedLeadId(
                sourcedLead,
                newLead,
                emailType,
              );
              funnel = await this.funnelsService.getFunnelWithLeadAndEvents(
                funnel.id,
              );
              // await this.searchService.indexLeadFunnel(funnel);
            }
          }
          if (
            !sourcedLead &&
            moment(newLead.creationDate).format('YYYY-MM-DD') >= '2020-06-29' &&
            newLead.model.emailType &&
            newLead.isValid === true &&
            // se envía mail de primer contacto o livestore solo si la fecha estimada de compra es 1 o 2 meses
            // para las dos campañas de livestore siempre se envía email sin importar la fecha estimada
            (!newLead.normalizedEstimatedPurchaseDate ||
              newLead.normalizedEstimatedPurchaseDate === '1 MES' ||
              newLead.normalizedEstimatedPurchaseDate === '2 MESES' ||
              newLead.campaign.name === 'GMEC LiveStore' ||
              newLead.campaign.name === 'GMCO_Live Store')
          ) {
            // create funnel if creation date >= 29/06/2020
            funnel = await this.funnelsService.createFunnelFromLead(
              newLead,
              newLead.opportunityName,
              emailType,
            );
            funnel = await this.funnelsService.getFunnelWithLeadAndEvents(
              funnel.id,
            );
            // await this.searchService.indexLeadFunnel(funnel);
            sendEmail = true;
          }
          // send email if it wasn't send from sourced leads or if it doens't have a sourced lead
          if (
            sendEmail &&
            newLead.model.emailType &&
            newLead.isValid === true
          ) {
            // send first contact email is the same for livestore
            // const mailSended = await this.emailsService.sendFirstContactEmail({
            //   to: newLead.email,
            //   context: {
            //     lead: newLead,
            //     funnel,
            //   },
            // });
            // if (mailSended) {
            //   newLead.emailSentAt = new Date();
            // }
          }
          newLead.status = LeadStatus.SIEBEL;
          await this.repo.save(newLead);
        }
      }
    }
  }

  /**
   * Gets last imported lead date
   * @param campaign Campaign to get last imported lead
   */
  async getLastImportedLeadDate(campaign: Campaign) {
    const query = getConnection()
      .getRepository(Lead)
      .createQueryBuilder('l')
      .select('MAX(l.creationDate)', 'maxDate')
      .where('l.campaign = :campaign', { campaign: campaign.id })
      .andWhere('l.source = :source', { source: campaign.source });

    const { maxDate } = await query.getRawOne();
    return maxDate;
  }

  /**
   * Updates existing Lead by Oportunity Name
   * @param lead Lead to verify if already exists
   */
  async updateExistingLead(lead: Lead): Promise<boolean> {
    const existingLead = await this.repo.findOne({
      where: {
        opportunityName: lead.opportunityName,
      },
      relations: ['dealerDealership'],
    });

    if (existingLead) {
      //change document if it change and validate document
      if (
        moment(existingLead.creationDate).format('YYYY-MM-DD') < '2020-06-23'
      ) {
        if (existingLead.document !== lead.document) {
          this.validateDocument(existingLead);
        } else {
          existingLead.documentIsValid = lead.documentIsValid;
        }
      }
      if (
        existingLead.status === LeadStatus.SIEBEL &&
        lead.saleStage === 'Cerrado-Vinculado'
      ) {
        existingLead.isValid = false;
        existingLead.status = LeadStatus.DISCARDED;
        existingLead.observation = 'Invalidado por estado Cerrado-Vinculado.';
      }

      if (existingLead.saleStage !== lead.saleStage) {
        existingLead.saleStage = lead.saleStage;
        existingLead.saleStageDate = lead.saleStageDate;
      }

      if (existingLead.dealerDealership.id !== lead.dealerDealership.id) {
        existingLead.dealerDealership = lead.dealerDealership;
        existingLead.dealerDealershipName = lead.dealerDealershipName;
        existingLead.bac = lead.bac;
      }

      await this.repo.save(existingLead);
      return true;
    }

    return false;
  }

  /**
   * Validate if Lead is Duplicated
   * @param lead Lead to validate duplicate
   */
  async validateDuplicate(lead: Lead) {
    const duplicatedPeriod = this.utilitiesService.duplicatedPeriod;
    const leadDate = moment(lead.creationDate);
    const periodDate = clone(leadDate);
    periodDate.subtract(duplicatedPeriod, 'days');

    // sourced leads query
    const query = getConnection()
      .getRepository(Lead)
      .createQueryBuilder('l')
      .where('l.creationDate >= :periodDate', {
        periodDate: periodDate.format('YYYY-MM-DD HH:mm:ss'),
      })
      .andWhere('l.document = :document', { document: lead.document })
      .andWhere('l.isValid <> 0');

    if (lead.validateSelfCampaignDuplicates) {
      query.andWhere('l.campaign = :campaign', { campaign: lead.campaign.id });
    }

    if (lead.dealerDealership) {
      query.innerJoin('l.dealerDealership', 'dd');
      query.innerJoin('dd.dealerCity', 'dc');
      query.andWhere('dc.dealerGroup = :dealerGroup', {
        dealerGroup: lead.dealerDealership.dealerCity.dealerGroup.id,
      });
    }

    const duplicates = await query.getMany();

    if (duplicates.length > 0) {
      lead.duplicated = true;
      lead.isValid = false;
      lead.observation = 'Duplicado';
    } else {
      lead.duplicated = false;
    }
  }

  /**
   * Process Direct Uploads File
   * @param filePath File Path
   * @param fileName File Name
   */
  async directUploadsToDatabase(
    filePath: string,
    fileName: string,
  ): Promise<string | null> {
    const errors: ValidationError[] = [];
    let rowNumber = 0;
    // Create a stream to read the file
    let stream = await getXlsxStream({ filePath, sheet: 0 });
    for await (const line of stream) {
      rowNumber += 1;
      // Skip the first row since it contains the headers for each column
      if (rowNumber === 1) {
        continue;
      }
      const rowErrors = await this.validateRow(line.formatted.arr);
      if (rowErrors.length > 0) {
        errors.push({ rowNumber, errors: rowErrors, row: line.formatted.arr });
      }
    }
    // When there are errors, return the resulting file destination so it can be uploaded
    // and do not touch the database
    if (errors.length > 0) {
      const errorsFileDestination = `temp/errores-${fileName}`;
      await this.utilitiesService.createErrorsFile(
        errorsFileDestination,
        errors,
        [
          'Fila',
          'Errores',
          'Fecha de Creación',
          'Fecha de la etapa de ventas',
          'Nombre de la campaña',
          'Tipo de oportunidad',
          'Etapa de venta',
          'ID de la oportunidad',
          'Distribuidor original Código BAC',
          'Distribuidor',
          'ID del cliente',
          'Nombre del contacto',
          'Apellidos del contacto',
          'Teléfono móvil',
          'Teléfono particular',
          'Teléfono de trabajo',
          'Direccíon de correo electrónico',
          'Modelo',
        ],
      );
      return errorsFileDestination;
    }
    // When there is no error, upload the information to the database
    stream = await getXlsxStream({ filePath, sheet: 0 });
    for await (const line of stream) {
      // Skip the first row since it contains the headers for each column
      if (rowNumber === 1) {
        continue;
      }
      await this.createFromRow(line.formatted.arr);
    }
    return null;
  }

  async getLeadsResults(
    fromYearMonth: string,
    dealerGroup: DealerGroup | null = null,
    lastYear: string | null = null,
  ): Promise<any> {
    let query = getConnection()
      .getRepository(Lead)
      .createQueryBuilder('l')
      .select('COUNT(l.opportunityName)', 'numLeads')
      .innerJoin('l.dealerDealership', 'dd')
      .innerJoin('dd.dealerCity', 'dc')
      .innerJoin('dc.dealerGroup', 'dg')
      .addSelect('dc.id', 'dealer')
      .addSelect("DATE_FORMAT(l.creationDate, '%Y-%m')", 'filterYearMonth')
      .where("l.status = 'SIEBEL'")
      .andWhere('l.isValid = true')
      .andWhere("DATE_FORMAT(l.creationDate, '%Y-%m') IS NOT NULL")
      .andWhere('dc.ignore = false')
      .andWhere("DATE_FORMAT(l.creationDate, '%Y-%m') >= :fromYm", {
        fromYm: fromYearMonth,
      });

    //if report is for last year
    if (lastYear) {
      query = query.andWhere("DATE_FORMAT(l.creationDate, '%Y-%m') <= :toYm", {
        toYm: lastYear + '-12',
      });
    }
    //if the parameter dealerCity is send we filter the results just for that dealer
    if (dealerGroup) {
      query = query.andWhere('dg.id = :dealerGroupId', {
        dealerGroupId: dealerGroup.id,
      });
    }

    const leadsResults = await query
      .groupBy('dealer')
      .addGroupBy('filterYearMonth')
      .getRawMany();

    //start to build the array that has the dealerCityId as the key
    //[dealerCityId][yearMonth][leads]
    const resultsArray = {};
    leadsResults.map(function(lr) {
      if (!resultsArray[lr.dealer]) {
        resultsArray[lr.dealer] = {};
      }
      resultsArray[lr.dealer][lr.filterYearMonth] = {
        leads: parseInt(lr.numLeads),
      };
    });

    return resultsArray;
  }

  async getLeadsDetailResults(
    fromYearMonth: string,
    dealerGroup: DealerGroup | null = null,
    type: string,
    lastYear: string | null = null,
  ): Promise<any> {
    let query = getConnection()
      .getRepository(Lead)
      .createQueryBuilder('l')
      .select("DATE_FORMAT(l.creationDate, '%Y-%m')", 'filterYearMonth')
      .addSelect('l.creationDate', 'creationDate')
      .addSelect('dd.bac', 'bac')
      .addSelect('dd.name', 'dealer')
      .addSelect('z.name', 'zone')
      .addSelect('c.name', 'campaign')
      .addSelect('l.opportunityName', 'opportunityName')
      .addSelect('l.duplicated', 'invalid')
      .addSelect('l.document', 'document')
      .addSelect('l.names', 'names')
      .addSelect('l.lastNames', 'lastNames')
      .addSelect(
        'l.normalizedEstimatedPurchaseDate',
        'normalizedEstimatedPurchaseDate',
      )
      .addSelect('m.model', 'model')
      .innerJoin('l.dealerDealership', 'dd')
      .innerJoin('dd.dealerCity', 'dc')
      .innerJoin('dc.dealerGroup', 'dg')
      .innerJoin('dc.zone', 'z')
      .innerJoin('l.campaign', 'c')
      .innerJoin('l.model', 'm');

    if (type === 'overall') {
      query.leftJoinAndSelect('l.overallSales', 's');
    } else {
      query.leftJoinAndSelect('l.sales', 's');
    }
    query.leftJoinAndSelect('s.model', 'sm');
    query
      .where("l.status = 'SIEBEL'")
      .andWhere(
        new Brackets(qb => {
          qb.where('l.isValid = true').orWhere('l.duplicated = true');
        }),
      )
      .andWhere("DATE_FORMAT(l.creationDate, '%Y-%m') IS NOT NULL")
      .andWhere('dc.ignore = false')
      .andWhere("DATE_FORMAT(l.creationDate, '%Y-%m') >= :fromYm", {
        fromYm: fromYearMonth,
      });

    //if report is for last year
    if (lastYear) {
      query = query.andWhere("DATE_FORMAT(l.creationDate, '%Y-%m') <= :toYm", {
        toYm: lastYear + '-12',
      });
    }
    //if the parameter dealerCity is send we filter the results just for that dealer
    if (dealerGroup) {
      query = query.andWhere('dg.id = :dealerGroupId', {
        dealerGroupId: dealerGroup.id,
      });
    }

    const leadsResults = await query.getRawMany();

    return leadsResults;
  }

  /**
   * Validates Dealer and updates Lead
   * @param lead Lead | SourcedLead
   */
  async validateDealer(
    lead: Lead | SourcedLead,
  ): Promise<{
    isValid: boolean;
    observation: string;
  }> {
    const validation = {
      isValid: false,
      observation: '',
    };

    if (lead.bac) {
      const dealerDealership = await this.dealersDealershipsService.findByBac(
        lead.bac,
      );

      if (dealerDealership) {
        lead.dealerDealership = dealerDealership;
        validation.isValid = true;
      } else {
        validation.observation = 'Concesionario no es válido.';
      }
    } else {
      validation.observation = 'No hay concesionario.';
    }

    return validation;
  }

  /**
   * Validates Dealer City with Lead City and updates Lead
   * @param lead Lead | SourcedLead
   */
  async validateDealerCity(
    lead: Lead | SourcedLead,
  ): Promise<{
    isValid: boolean;
    observation: string;
  }> {
    const validation = {
      isValid: false,
      observation: '',
    };

    if (lead.cityName) {
      const city = await this.citiesService.findByNameOrAlias(lead.cityName);

      if (city) {
        lead.city = city;
        if (
          lead.dealerDealership &&
          lead.dealerDealership.city &&
          lead.dealerDealership.city.id === city.id
        ) {
          validation.isValid = true;
        } else {
          validation.observation = 'Ciudad no corresponde a concesionario.';
        }
      } else {
        validation.observation = 'La ciudad no es válida.';
      }
    } else {
      validation.observation = 'No hay ciudad.';
    }

    return validation;
  }

  /**
   * Validates Estimated Purchase Date and normalize
   * @param lead Lead | SourcedLead
   */
  async validateEstimatedPurchaseDate(
    lead: Lead | SourcedLead,
  ): Promise<{
    isValid: boolean;
    observation: string;
  }> {
    const validation = {
      isValid: false,
      observation: '',
    };

    // The Source Uploads is returning an error with the estimatedPurchaseDate
    // to solve this problem quickly, I just remove (TEMPORARILY) this validation
    lead.normalizedEstimatedPurchaseDate = lead.estimatedPurchaseDate;
    return {
      isValid: true,
      observation: '',
    };

    const estimatedPurchaseDate = await this.estimatedPurchaseDateAliasesService.findOne(
      {
        where: { alias: lead.estimatedPurchaseDate },
      },
    );

    if (estimatedPurchaseDate) {
      lead.normalizedEstimatedPurchaseDate = estimatedPurchaseDate.name;
      validation.isValid = true;
    } else {
      validation.observation = 'Fecha estimada de compra no válida';
    }

    return validation;
  }

  /**
   * Validates if Lead is for testing
   * @param lead Lead | SourcedLead
   */
  validateTest(lead: Lead | SourcedLead): void {
    if (
      this.utilitiesService.containtsTest(lead.email) ||
      this.utilitiesService.containtsTest(lead.names) ||
      this.utilitiesService.containtsTest(lead.lastNames) ||
      this.utilitiesService.containtsTest(lead.cityName) ||
      this.utilitiesService.containtsTest(lead.dealerDealershipName)
    ) {
      lead.status = LeadStatus.DISCARDED;
      lead.observation = 'Datos de Prueba';
    }
  }

  /**
   * Validate Phone and Mobile of Lead
   * @param lead Lead to validate
   */
  async validatePhone(lead: Lead | SourcedLead): Promise<void> {
    let validationPhone = { isValid: false, phone: '', type: '' };
    let validationMobile = { isValid: false, phone: '', type: '' };

    if (this.instanceSlug === 'ec') {
      validationPhone = await this.utilitiesService.validatePhone(lead.phone);
      validationMobile = await this.utilitiesService.validatePhone(lead.mobile);
    } else if (this.instanceSlug === 'co') {
      validationPhone = await this.utilitiesService.validatePhone(
        lead.phone,
        this.instanceSlug,
        PhoneTypes.HOME,
      );
      validationMobile = await this.utilitiesService.validatePhone(
        lead.mobile,
        this.instanceSlug,
        PhoneTypes.MOBILE,
      );
    } else {
      validationPhone = {
        isValid: true,
        phone: lead.phone,
        type: PhoneTypes.HOME,
      };
      validationMobile = {
        isValid: true,
        phone: lead.mobile,
        type: PhoneTypes.MOBILE,
      };
    }

    // Validate phone if there is no way to get the phone then discard??? and go to nextlead
    if (
      (lead.phone && validationPhone.isValid) ||
      (lead.mobile && validationMobile.isValid)
    ) {
      lead.phoneIsValid = true;
      lead.phone = null;
      lead.mobile = null;

      if (validationPhone.isValid && validationPhone.type) {
        if (validationPhone.type === PhoneTypes.MOBILE) {
          lead.mobile = validationPhone.phone;
        } else {
          lead.phone = validationPhone.phone;
        }
      }

      if (validationMobile.isValid && validationMobile.type) {
        if (validationMobile.type === PhoneTypes.MOBILE) {
          lead.mobile = validationMobile.phone;
        } else {
          lead.phone = validationMobile.phone;
        }
      }
    } else {
      lead.phone = null;
      lead.mobile = null;
      // search phone by document in clean leads
      const phone = await this.getPhoneByDocument(lead.document);
      const mobile = await this.getPhoneByDocument(
        lead.document,
        PhoneTypes.MOBILE,
      );

      // if phone in clean then continue processs
      if (phone || mobile) {
        if (phone) {
          lead.phone = phone;
        }
        if (mobile) {
          lead.mobile = mobile;
        }
        lead.phoneIsValid = true;
      } else {
        // if no phone and no in clean then is not valid
        lead.phoneIsValid = false;
        lead.observation = 'Teléfono no válido.';
      }
    }
  }

  /**
   * Gets Phone from Leads searching by Document
   * @param document Document to search
   * @param type Field Phone or Mobile
   */
  async getPhoneByDocument(document: string, type = 'phone') {
    const foundPhone = await getConnection()
      .getRepository(Lead)
      .createQueryBuilder('l')
      .select(`l.${type}`, 'foundPhone')
      .where('l.status = :status', { status: LeadStatus.SIEBEL })
      .andWhere('l.document = :document', { document })
      .limit(1)
      .getRawOne();

    if (foundPhone) {
      return foundPhone.foundPhone;
    }

    return false;
  }

  /**
   * Cleans and validates document
   * @param record Lead | SourcedLead | Sale to validate document
   */
  validateDocument(record: Lead | SourcedLead | Sale) {
    let validDocument = {
      isValid: false,
    };
    // Clean and validate document
    record.document = this.utilitiesService.cleanDocument(
      record.document,
      this.instanceSlug,
    );

    if (this.instanceSlug === 'ec') {
      validDocument = this.utilitiesService.validateDocument(record.document);
    } else {
      validDocument.isValid = true;
    }

    record.documentIsValid = validDocument.isValid;
  }

  /**
   * Validate email from Lead or Sales
   * @param record Lead | Sale | SourcedLead
   * @param validEmails array of emails already validated to avoid validating twice
   */
  async validateEmail(record: Lead | Sale | SourcedLead, validEmails = []) {
    if (record.email) {
      record.email = this.utilitiesService.cleanSpaceSpecialCharacter(
        record.email,
      );

      // verify if email exists already an it is validated
      const existingEmailResult = await this.existsValidatedEmail(record.email);

      // if exists is already valid
      if (existingEmailResult || validEmails.includes(record.email)) {
        record.emailIsValid = true;
        validEmails.push(record.email);
      } else {
        const emailValidation = await this.utilitiesService.validateEmail(
          record.email,
        );

        if (emailValidation.isValid) {
          validEmails.push(record.email);
          record.emailIsValid = true;
        } else {
          if (record instanceof Lead || record instanceof SourcedLead) {
            // if no valid email then search email by document in siebel leads
            const foundEmail = await this.getEmailByDocument(record.document);

            // if email in clean leads then continue process normally
            if (foundEmail) {
              record.email = foundEmail;
              validEmails.push(foundEmail);
              record.emailIsValid = true;
            } else {
              record.emailIsValid = false;
              record.invalidEmailReason = emailValidation.message;
            }
          } else {
            record.emailIsValid = false;
            record.invalidEmailReason = emailValidation.message;
          }
        }
      }
    } else {
      record.emailIsValid = false;
      record.invalidEmailReason = 'No email found';
    }
  }

  /**
   * Verified if email exists in Leads and Sales
   * @param email Email to verify
   */
  async existsValidatedEmail(email: string): Promise<boolean> {
    const sources = [Lead, Sale, SourcedLead];

    for (const source of sources) {
      const existsEmail = await getConnection()
        .getRepository(source)
        .createQueryBuilder('e')
        .select('e.email', 'existsEmail')
        .where('e.emailIsValid = 1')
        .andWhere('e.email = :email', { email: trim(email) })
        .limit(1)
        .getRawOne();

      if (existsEmail) {
        return true;
      }
    }

    return false;
  }

  /**
   * Search email by document on SIEBEL leads
   * @param document document to search
   */
  async getEmailByDocument(document: string): Promise<string | null> {
    // search only in clean leads (status SIEBEL)
    const foundEmail = await getConnection()
      .getRepository(Lead)
      .createQueryBuilder('l')
      .select('l.email', 'foundEmail')
      .where('l.document = :document', { document })
      // .andwhere('e.emailIsValid = 1')
      .andWhere('l.status = :status', { status: LeadStatus.SIEBEL })
      .limit(1)
      .getRawOne();

    if (foundEmail) {
      return foundEmail.foundEmail;
    }

    return null;
  }

  async getYearValidLeadsForDealer(
    dealerId: number | 'all',
    onlyDdp = false,
  ): Promise<{ count: number; period: string }[]> {
    const today = moment.now();
    const from = moment(today).subtract(12, 'months');
    // Search results only until last thursday
    let to: Date;
    const {
      cutOffDay,
      isTheSameWeek,
    } = this.utilitiesService.getCutOffDateAndWeek();
    if (isTheSameWeek) {
      to = endOfDay(setDay(new Date(), cutOffDay));
    } else {
      // If not, take past's weeks cut off date
      to = endOfDay(setDay(add(new Date(), { weeks: -1 }), cutOffDay));
    }
    if (to.getMonth() !== new Date().getMonth()) {
      // When the resulting date has a diffrent month than today, retrun the leads until the end of the month
      to = endOfMonth(to);
    }

    const query = getConnection()
      .getRepository(Lead)
      .createQueryBuilder('l')
      .select('Count(l.opportunityName)', 'count')
      .addSelect('DATE_FORMAT(l.creationDate, "%Y-%m")', 'month')
      .innerJoin('l.campaign', 'lc')
      .innerJoin('l.dealerDealership', 'dd')
      .innerJoin('dd.dealerCity', 'dc')
      .innerJoin('dc.dealerGroup', 'dg')
      .where('l.status = "SIEBEL"')
      .andWhere('l.isValid = true')
      .andWhere('DATE_FORMAT(l.creationDate, "%Y-%m") IS NOT NULL')
      .andWhere('dc.ignore = false')
      .andWhere('dg.ignoreOnFunnels = false')
      .andWhere('l.creationDate BETWEEN :fromYm AND :toYm', {
        fromYm: from.format('YYYY-MM') + '-01 00:00:00',
        toYm: format(to, 'yyyy-MM-dd kk:mm:ss'),
      });
    if (dealerId !== 'all') {
      query.andWhere('dg.id = :dealerGroupId', {
        dealerGroupId: dealerId,
      });
    }
    if (onlyDdp) {
      query.andWhere('lc.isDdp = true');
    }
    query.groupBy('DATE_FORMAT(l.creationDate, "%Y-%m")');
    const rawResult = await query.getRawMany();
    const result = [];
    const periods = this.utilitiesService.get12MonthsFromNowPeriods();

    //build result with missing periods
    periods.forEach(period => {
      const resultForMonth = rawResult.find(r => r.month === period);
      if (resultForMonth) {
        result.push({ count: Number(resultForMonth.count), period: period });
      } else {
        result.push({ count: 0, period: period });
      }
    });

    return result;
  }

  async searchLead(search: string, userDealerGroupId?: number) {
    const query = this.repo.createQueryBuilder('l');
    query
      .select('l.names', 'names')
      .addSelect('l.lastNames', 'lastNames')
      .addSelect('l.phone', 'phone')
      .addSelect('l.workPhone', 'workPhone')
      .addSelect('l.mobile', 'mobile')
      .addSelect('l.email', 'email')
      .addSelect('l.document', 'document')
      .addSelect('l.opportunityName', 'opportunityName')
      .innerJoin('l.model', 'm')
      .innerJoin('l.dealerDealership', 'dd')
      .innerJoin('dd.dealerCity', 'dc')
      .innerJoin('dc.dealerGroup', 'dg')
      .addSelect('m.model', 'model')
      .addSelect('dd.name', 'dealerDealership')
      .where("l.status = 'SIEBEL'")
      .andWhere('l.isValid = true')
      .andWhere(
        new Brackets(qb => {
          qb.where('l.email LIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('l.document LIKE :search', { search: `%${search}%` })
            .orWhere('l.phone LIKE :search', { search: `%${search}%` })
            .orWhere('l.workPhone LIKE :search', { search: `%${search}%` })
            .orWhere('l.mobile LIKE :search', { search: `%${search}%` });
        }),
      );
    if (userDealerGroupId) {
      query.andWhere('dg.id = :dealerGroupId', {
        dealerGroupId: userDealerGroupId,
      });
    }
    query.orderBy('l.creationDate', 'DESC');
    return await query.getRawOne();
  }
}

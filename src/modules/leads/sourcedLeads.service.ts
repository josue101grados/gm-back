import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Brackets, MoreThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CampaignsService } from 'modules/campaigns/campaigns.service';
import { IgnoredCampaignsService } from 'modules/campaigns/ignoredCampaigns.service';
import { EmailsService } from 'modules/emails/emails.service';
import { ModelsService } from 'modules/models/models.service';
import { LeadsService } from './leads.service';
import { UploadsService } from 'modules/uploads/uploads.service';
import {
  UtilitiesService,
  ValidationError,
} from 'modules/utilities/utilities.service';
import { Campaign } from 'modules/campaigns/campaign.entity';
import { SourcedLead, LeadStatus, LeadSources } from './sourcedLead.entity';
import { getXlsxStream } from 'xlstream';
import * as facebookTokens from 'config/files/facebook_tokens.json';
import adsSdk = require('facebook-nodejs-business-sdk');
import { clone, toArray, toUpper, toLower } from 'lodash';
import * as Excel from 'exceljs';
import moment = require('moment-timezone');
import { Lead } from './lead.entity';
import { parse } from 'date-fns';
import { Transform } from 'stream';
import { Funnel, LeadTypes } from 'modules/funnels/funnel.entity';
import { FunnelsService } from 'modules/funnels/funnels.service';
import { DealerDealershipsService } from 'modules/dealers/dealerDealerships.service';
import { EmailTypes } from 'modules/models/model.entity';

@Injectable()
export class SourcedLeadsService extends TypeOrmCrudService<SourcedLead> {
  private readonly logger = new Logger(SourcedLeadsService.name);
  private instanceSlug;

  constructor(
    @InjectRepository(SourcedLead) repo,
    private configService: ConfigService,
    private campaignsService: CampaignsService,
    private emailsService: EmailsService,
    private ignoredCampaignsService: IgnoredCampaignsService,
    private modelsService: ModelsService,
    @Inject(forwardRef(() => LeadsService))
    private leadsService: LeadsService,
    private uploadsService: UploadsService,
    private utilitiesService: UtilitiesService,
    private funnelsService: FunnelsService,
    private dealersDealershipsService: DealerDealershipsService,
  ) {
    super(repo);
    this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
  }

  /**
   * Imports Leads From Facebook API
   */
  async importFacebookLeads() {
    const appId = this.configService.get('GM_FACEBOOK_APP_ID');
    const appSecret = this.configService.get('GM_FACEBOOK_APP_SECRET');
    const importFacebookLeads = this.configService.get(
      'GM_IMPORT_FACEBOOK_LEADS',
    );

    const Page = adsSdk.Page;
    const Ad = adsSdk.Ad;

    if (importFacebookLeads) {
      this.logger.verbose('Importing Facebook Leads...');

      let apiCalls = 0;
      const errors: ValidationError[] = [];
      const defaultRow = {
        campaign: '',
        date: '',
        dealer: '',
        model: '',
        estimatedPurchaseDate: '',
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        city: '',
        document: '',
        typeOfService: '',
        mileageEstimated: '',
      };

      const ignoredCampaigns = await this.ignoredCampaignsService.find({
        select: ['name'],
      });

      const lastDateImportedByCampaign = {};

      for (const pageData of facebookTokens[this.instanceSlug].data) {
        const accessToken = pageData.access_token;
        this.logger.verbose(
          `Importing Facebook Page: ${pageData.id} - ${pageData.name}`,
        );

        // For testing to Skip all Pages and only process one
        // if (pageData.id !== '665449046977280') {
        //   continue;
        // }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const api = adsSdk.FacebookAdsApi.init(accessToken);

        try {
          const page = new Page(pageData.id);
          const params = {
            limit: '500',
          };

          const leadGenForms = await page.getLeadGenForms([], params);
          apiCalls++;

          for (const leadGenForm of leadGenForms) {
            this.logger.verbose(
              `Importing Facebook Ad/Campaign: ${leadGenForm.name}`,
            );

            // Check If Campaign should be Ignored
            const ignoreCampaign = ignoredCampaigns.find(
              ic => ic.name === leadGenForm.name,
            );
            if (ignoreCampaign) {
              this.logger.warn(
                `Ignoring Facebook Ad/Campaign: ${leadGenForm.name}`,
              );
              continue;
            }

            // Find Campaign by Alias
            const campaign = await this.campaignsService.findByNameOrAlias(
              leadGenForm.name,
            );

            if (campaign) {
              if (!lastDateImportedByCampaign[campaign.id]) {
                const lastDate = await this.getLastImportedLeadDate(campaign);
                lastDateImportedByCampaign[campaign.id] = lastDate;
              }

              const ad = new Ad(leadGenForm.id);
              const leads = await ad.getLeads([], params);
              apiCalls++;

              leads.reverse(); // Reverse leads to insert in order of date ASC

              for (const lead of leads) {
                console.log('>>>');
                console.log('lead id', lead.id);
                console.log('lead created_time', lead.created_time);
                console.log('lead', lead.field_data);
                let row = clone(defaultRow);
                row.campaign = leadGenForm.name;
                let rowErrors: string[] = [];

                // Check if lead was already imported
                const existsLead = await this.repo.findOne({
                  where: {
                    campaign: campaign.id,
                    externalId: lead.id,
                  },
                });

                if (!existsLead) {
                  const newLead = new SourcedLead();
                  newLead.externalId = lead.id;
                  newLead.externalFormName = leadGenForm.name;
                  newLead.campaign = campaign;
                  newLead.campaignName = leadGenForm.name;
                  newLead.source = campaign.source;
                  const date = moment.tz(
                    lead.created_time,
                    'America/Los_Angeles',
                  );
                  newLead.date = date.tz('America/Guayaquil').toDate();
                  row.date = date.tz('America/Guayaquil').toDate();

                  let comments = '';
                  for (const field of lead.field_data) {
                    switch (field.name) {
                      case 'dealer':
                      case 'Dealer':
                        newLead.dealerDealershipName = field.values[0];
                        row.dealer = field.values[0];
                        break;
                      case 'model':
                        newLead.modelName = field.values[0];
                        row.model = field.values[0];
                        break;
                      case 'estimated_purchase_date':
                        newLead.estimatedPurchaseDate = field.values[0];
                        row.estimatedPurchaseDate = field.values[0];
                        break;
                      case 'first_name':
                        newLead.names = field.values[0];
                        row.firstName = field.values[0];
                        break;
                      case 'last_name':
                        newLead.lastNames = field.values[0];
                        row.lastName = field.values[0];
                        break;
                      case 'email':
                        newLead.email = field.values[0];
                        row.email = field.values[0];
                        break;
                      case 'telephone':
                        newLead.phone = field.values[0];
                        row.telephone = field.values[0];
                        break;
                      case 'city':
                        newLead.cityName = field.values[0];
                        row.city = field.values[0];
                        break;
                      case 'document':
                        newLead.document = field.values[0];
                        row.document = field.values[0];
                        break;
                      case 'mileage_(estimated)':
                        comments = newLead.otherComments
                          ? newLead.otherComments + ' | '
                          : '';
                        newLead.otherComments = comments + field.values[0];
                        row.mileageEstimated = field.values[0];
                        break;
                      case 'type_of_service':
                        comments = newLead.otherComments
                          ? newLead.otherComments + ' | '
                          : '';
                        newLead.otherComments = comments + field.values[0];
                        row.typeOfService = field.values[0];
                        break;
                    }
                  }

                  // Process Lead Import
                  rowErrors = await this.processImportSourceLead(
                    newLead,
                    lastDateImportedByCampaign[campaign.id],
                  );

                  if (rowErrors.length > 0) {
                    console.log('rowErrors', rowErrors);

                    row = toArray(row);
                    errors.push({
                      rowNumber: lead.id,
                      errors: rowErrors,
                      row,
                    });
                  }
                }
              }
            } else {
              this.logger.warn(
                `No existe el alias para la campaña: '${leadGenForm.name}'`,
              );

              let row = clone(defaultRow);
              const rowErrors = [
                `No existe el alias para la campaña: '${leadGenForm.name}'`,
              ];
              row.campaign = leadGenForm.name;
              row = toArray(row);
              errors.push({ rowNumber: 0, errors: rowErrors, row });
            }
          }
        } catch (e) {
          this.logger.error(
            `Error Importing Facebook Page: ${pageData.id} - ${pageData.name} - ${e}`,
          );
          let row = clone(defaultRow);
          row.campaign = `Facebook Page: ${pageData.id} - ${pageData.name}`;
          row = toArray(row);
          errors.push({ rowNumber: 0, errors: [e], row });
          break;
        }
      }

      this.logger.log(`Calls to API: ${apiCalls}`);

      let sendErrorsEmail = false;
      let errorsFileUrl = null;
      if (errors.length > 0) {
        sendErrorsEmail = true;
        const today = moment();
        const errorsFilePath = `temp/errores-import-facebook-${today.format(
          'YYYY-MM-DD_HHmm',
        )}.xlsx`;
        const errorsFileDestination = `imports/facebook-import/errors/errors-${today.format(
          'YYYY-MM-DD_HHmm',
        )}.xlsx`;

        await this.utilitiesService.createErrorsFile(errorsFilePath, errors, [
          'Facebook Lead Id',
          'Errores',
          'Campaña',
          'Fecha de Creación',
          'Punto de Venta',
          'Modelo',
          'Fecha Estimada de Compra',
          'Nombre',
          'Apellido',
          'Email',
          'Teléfono',
          'Ciudad',
          'Documento',
          'Tipo de Servicio',
          'Mileage',
        ]);

        const uploadResponse = await this.uploadsService.uploadAndGetPublicUrl(
          errorsFilePath,
          errorsFileDestination,
        );

        errorsFileUrl = uploadResponse.publicURL;

        await this.uploadsService.deleteFile(errorsFilePath);
      }

      // await this.emailsService.sendImportLeadsEmail({
      //   to: this.configService.get<string>('GM_NOTIFICATIONS_MAIL_TO'),
      //   context: {
      //     type: 'Facebook',
      //     sendErrorsEmail,
      //     errorsURL: errorsFileUrl,
      //   },
      // });
    }
  }

  /**
   * Gets last imported lead date
   * @param campaign Campaign to get last imported lead
   */
  async getLastImportedLeadDate(campaign: Campaign) {
    const query = getConnection()
      .getRepository(SourcedLead)
      .createQueryBuilder('l')
      .select('MAX(l.date)', 'maxDate')
      .where('l.campaign = :campaign', { campaign: campaign.id })
      .andWhere('l.source = :source', { source: campaign.source });

    const { maxDate } = await query.getRawOne();
    return maxDate;
  }

  /**
   * Process Lead for importing from Sources Upload or Facebook Import
   * @param lead Lead to import
   * @param lastLeadImported Last Lead Imported Date
   * @param justValidate Flag to make the function just validate and not insert in the database
   */
  async processImportSourceLead(
    lead: SourcedLead,
    lastLeadImported,
    justValidate = false,
  ): Promise<string[]> {
    let canCreate = true;
    const errors = [];
    // Validate it has a created date and campaign, if not then ignore
    if (!lead.date) {
      errors.push('Campo Fecha es obligatorio');
    }
    if (!lead.campaign) {
      errors.push('Código de campaña no fue encontrado');
    }

    // Clean for validating if record exists already
    const document = this.utilitiesService.cleanDocument(
      lead.document,
      this.instanceSlug,
    );
    if (this.instanceSlug === 'ec') {
      if (document) {
        if (document.length < 9 || document.length > 13) {
          errors.push('Documento no es válido');
        }
      }
    }
    lead.document = document;

    // Verify that lead date is after the last lead imported
    if (lead.date && lastLeadImported) {
      const lastLeadImportedDate = moment.tz(
        lastLeadImported,
        'America/Guayaquil',
      );
      const leadDate = moment.tz(lead.date, 'America/Guayaquil');
      if (leadDate.valueOf() < lastLeadImportedDate.valueOf()) {
        canCreate = false;
        // 24 hours before $last_lead_imported
        const dayAgoLastDate = clone(lastLeadImportedDate);
        dayAgoLastDate.subtract(1, 'days');
        if (lead.document && lead.document !== '0') {
          if (leadDate.valueOf() >= dayAgoLastDate.valueOf()) {
            const existsLead = await this.repo.findOne({
              where: {
                document: lead.document,
                date: leadDate.format('YYYY-MM-DD HH:mm:ss'),
              },
            });
            if (!existsLead) {
              canCreate = true;
            }
          }
        } else {
          canCreate = true;
        }
      }
    }

    if (lead.modelName) {
      const model = await this.modelsService.findByNameOrAlias(lead.modelName);
      if (!model) {
        errors.push(`No existe alias para el modelo: ${lead.modelName}`);
      } else {
        lead.model = model;
      }
    } else {
      errors.push('No tiene modelo');
    }

    // validate dealer, if not valid send to errors file
    const dealerValidation = await this.validateDealer(lead);
    if (!dealerValidation.isValid) {
      errors.push(dealerValidation.observation);
    }

    // validate dealer city, if not valid send to errors file
    // const dealerCityValidation = await this.leadsService.validateDealerCity(
    //   lead,
    // );
    // if (!dealerCityValidation.isValid) {
    //   errors.push(dealerCityValidation.observation);
    // }

    // validate and normalize the estimated purchase date
    // only if record has a Estimated Purchase Date, added because Facebook Post venta form don't come with that field
    if (lead.estimatedPurchaseDate) {
      const estimatedPurchaseDateValidation = await this.leadsService.validateEstimatedPurchaseDate(
        lead,
      );
      if (!estimatedPurchaseDateValidation.isValid) {
        errors.push(estimatedPurchaseDateValidation.observation);
      }
    }

    if (justValidate) {
      canCreate = false;
    }

    if (errors.length === 0) {
      if (canCreate) {
        if (lead.campaign.validateSelfDuplicates) {
          lead.validateSelfCampaignDuplicates = true;
        }

        // this.leadsService.validateTest(lead);
        // if (lead.status === LeadStatus.DISCARDED) {
        //   this.repo.save(lead);
        //   return;
        // }

        // discard documents empty or with 0
        if (!lead.document || lead.document === '0' || lead.document === '') {
          lead.status = LeadStatus.DISCARDED;
          lead.documentIsValid = false;
          this.repo.save(lead);
          return [];
        }

        await this.leadsService.validatePhone(lead);
        // discard if the leads doesnt have any phone
        if (!lead.phone && !lead.mobile && !lead.workPhone) {
          lead.status = LeadStatus.DISCARDED;
          lead.phoneIsValid = false;
          this.repo.save(lead);
          return [];
        }
        // validate duplicates
        await this.validateDuplicate(lead);
        if (lead.duplicated) {
          this.repo.save(lead);
          return errors;
        }

        this.leadsService.validateDocument(lead);
        await this.leadsService.validateEmail(lead);

        this.utilitiesService.normalizeNames(lead);
        lead.status = LeadStatus.CLEAN;
        await this.repo.save(lead);

        // send first contact email
        if (
          lead.model.emailType &&
          (!lead.normalizedEstimatedPurchaseDate ||
            lead.normalizedEstimatedPurchaseDate === '1 MES' ||
            lead.normalizedEstimatedPurchaseDate === '2 MESES')
        ) {
          // if campaign is GMCO_GMF_Aprobados sin desembolsar and the email type is livestore, don't send the mail and don't create funnel
          if (
            lead.campaign.name === 'GMCO_GMF_Aprobados sin desembolsar' &&
            lead.model.emailType === EmailTypes.LIVE_STORE
          ) {
            return errors;
          }
          // create funnel if creation date >= 29/06/2020
          const funnel = await this.funnelsService.createFunnelFromSourcedLead(
            lead,
          );
          // send first contact email is the same for livestore
          // const mailSended = await this.emailsService.sendFirstContactEmail({
          //   to: lead.email,
          //   context: {
          //     lead,
          //     funnel,
          //   },
          // });
          // if (mailSended) {
          //   lead.emailSentAt = new Date();
          // }
        }
      }
    }
    return errors;
  }

  /**
   * Validate if SourcedLead is Duplicated
   * @param lead SourcedLead to validate document
   */
  async validateDuplicate(lead: SourcedLead) {
    const duplicatedPeriod = this.utilitiesService.duplicatedPeriod;
    const leadDate = moment(lead.date);
    const periodDate = clone(leadDate);
    periodDate.subtract(duplicatedPeriod, 'days');

    // sourced leads query
    const query = getConnection()
      .getRepository(SourcedLead)
      .createQueryBuilder('l')
      .where('l.date >= :periodDate', {
        periodDate: periodDate.format('YYYY-MM-DD HH:mm:ss'),
      })
      .andWhere('l.document = :document', { document: lead.document });
    // fb validate duplicates only with fb leads
    if (lead.externalId) {
      query.andWhere('l.externalId IS NOT NULL');
    } else {
      // sources validate duplicates only with sources leads
      query.andWhere('l.externalId IS NULL');
    }
    query.andWhere(
      new Brackets(qb => {
        qb.where('l.status IN (:statuses)', {
          statuses: [LeadStatus.CLEAN, LeadStatus.SIEBEL],
        }).orWhere(
          new Brackets(qb => {
            qb.where('l.status like :discarted', {
              discarted: LeadStatus.DISCARDED,
            }).andWhere('l.duplicated = true');
          }),
        );
      }),
    );
    if (lead.dealerDealership) {
      query.innerJoin('l.dealerDealership', 'dd');
      query.innerJoin('dd.dealerCity', 'dc');
      query.andWhere('dc.dealerGroup = :dealerGroup', {
        dealerGroup: lead.dealerDealership.dealerCity.dealerGroup.id,
      });
    }

    // leads query
    // const leadsQuery = getConnection()
    //   .getRepository(Lead)
    //   .createQueryBuilder('l')
    //   .where('l.creationDate >= :periodDate', {
    //     periodDate: periodDate.format('YYYY-MM-DD HH:mm:ss'),
    //   })
    //   .andWhere('l.document = :document', { document: lead.document })
    //   .andWhere('l.isValid <> 0');

    // if (lead.validateSelfCampaignDuplicates) {
    //   query.andWhere('l.campaign = :campaign', { campaign: lead.campaign.id });

    //   leadsQuery.andWhere('l.campaign = :campaign', {
    //     campaign: lead.campaign.id,
    //   });
    // }

    // if (lead.dealerDealership) {
    //   leadsQuery.innerJoin('l.dealerDealership', 'dd');
    //   leadsQuery.innerJoin('dd.dealerCity', 'dc');
    //   leadsQuery.andWhere('dc.dealerGroup = :dealerGroup', {
    //     dealerGroup: lead.dealerDealership.dealerCity.dealerGroup.id,
    //   });
    // }

    const duplicates = await query.getMany();
    // check in sourced leads
    if (duplicates.length > 0) {
      lead.duplicated = true;
      lead.observation = 'Duplicado';
      lead.status = LeadStatus.DISCARDED;
    } else {
      // check in leads
      // const leadsDuplicates = await leadsQuery.getMany();
      // if (leadsDuplicates.length > 0) {
      //   lead.duplicated = true;
      //   lead.observation = 'Duplicado';
      //   lead.status = LeadStatus.DISCARDED;
      // } else {
      lead.duplicated = false;
      // }
    }
  }

  /**
   * Validates Dealer and updates Lead
   * @param lead SourcedLead
   */
  async validateDealer(
    lead: SourcedLead,
  ): Promise<{
    isValid: boolean;
    observation: string;
  }> {
    const validation = {
      isValid: false,
      observation: '',
    };

    if (lead.bac || lead.dealerDealershipName) {
      const dealerDealership = await this.dealersDealershipsService.findByBacOrNameAlias(
        lead.bac,
        lead.dealerDealershipName,
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
   * Generate File with Leads for Siebel Upload
   */
  async generateLeadsForSiebelFile(): Promise<string | boolean> {
    const query = getConnection()
      .getRepository(SourcedLead)
      .createQueryBuilder('l')
      .innerJoinAndSelect('l.dealerDealership', 'dd')
      .innerJoinAndSelect('l.model', 'm')
      .leftJoinAndSelect('l.campaign', 'c')
      .where('l.status = :status', { status: LeadStatus.CLEAN })
      .andWhere('l.finalDownloadAt IS NULL')
      .orderBy('l.date', 'ASC')
      .orderBy('l.document', 'ASC');

    const leadsToDownload = await query.getMany();

    if (leadsToDownload.length > 0) {
      // Create Temp File
      let today = moment();
      const filename = `leads-for-siebel-${today.format(
        'YYYY-MM-DD_HH:mm:ss',
      )}.xlsx`;
      const fileLocation = `temp/${filename}`;
      const workbook = new Excel.stream.xlsx.WorkbookWriter({
        filename: fileLocation,
      });
      const worksheet = workbook.addWorksheet('Leads para Siebel');

      worksheet.addRow([
        'Código de mercado',
        'Fecha de modificación',
        'Saludo',
        'Nombre',
        'Segundo nombre',
        'Apellidos',
        'Código de país',
        'idioma',
        'Correo electrónico',
        'Teléfono particular',
        'Teléfono del trabajo',
        'Teléfono celular',
        'Marca',
        'Modelo',
        'Fuente',
        'ID de acción',
        'Tipo de contenido',
        'Código de distribuidor',
        'Comentarios',
        'Código del suministrador',
        'Sistema fuente',
        'Número de matrícula',
        'ID del cliente',
      ]);

      for (const lead of leadsToDownload) {
        const row: string[] = [];
        let estimatedPurchaseDate = 'Fecha estimada de compra: ';

        switch (lead.normalizedEstimatedPurchaseDate) {
          case '1 MES':
          case '2 MESES':
          case '3 MESES':
            estimatedPurchaseDate += toLower(
              lead.normalizedEstimatedPurchaseDate,
            );
            break;
          case '> 3 MESES':
            estimatedPurchaseDate += 'más de 3 meses';
            break;
          default:
            estimatedPurchaseDate = '';
        }
        // Add other comments
        if (lead.otherComments) {
          estimatedPurchaseDate += ' | ' + lead.otherComments;
        }

        let lastName = '';
        if (lead.lastName1 || lead.lastName2) {
          if (lead.lastName1 && lead.lastName2) {
            lastName = lead.lastName1 + ' ' + lead.lastName2;
          } else if (lead.lastName1 && !lead.lastName2) {
            lastName = lead.lastName1;
          } else {
            lastName = lead.lastName2;
          }
        } else {
          lastName = lead.lastNames;
        }

        // let phone = '';
        // if (lead.phone || lead.mobile || lead.workPhone) {
        //   if (lead.phone) {
        //     phone = lead.phone;
        //   } else if (lead.mobile) {
        //     phone = lead.mobile;
        //   } else if (lead.workPhone) {
        //     phone = lead.workPhone;
        //   }
        // }

        row.push(`GM${toUpper(this.instanceSlug)}`);
        row.push(lead.date ? moment(lead.date).format('YYYYMMDD') : '');
        row.push('');
        row.push(lead.name1 ? lead.name1 : lead.names);
        row.push(lead.name2);
        row.push(lastName);
        row.push(toUpper(this.instanceSlug));
        row.push('ES');
        row.push(lead.email);
        row.push(lead.phone);
        row.push(lead.workPhone);
        row.push(lead.mobile);
        row.push('CHEVROLET');
        row.push(lead.model ? lead.model.family : '');
        row.push('HR');
        row.push(lead.campaign ? lead.campaign.actionId : '');
        row.push(lead.campaign ? lead.campaign.contentType : '');
        row.push(
          lead.dealerDealership
            ? lead.dealerDealership.bac
            : lead.dealerDealershipName,
        );
        row.push(estimatedPurchaseDate);
        row.push('NSC');
        row.push('ROADTRACK');
        row.push('');
        row.push(lead.document);

        worksheet.addRow(row);
      }
      worksheet.commit();
      await workbook.commit();

      // Upload File to google
      const fileDestination = `downloads/leads-for-siebel/${filename}`;
      const filePath = `temp/${filename}`;
      const uploadResponse = await this.uploadsService.uploadAndGetPublicUrl(
        filePath,
        fileDestination,
      );
      // Update Leads
      const leadsIds = leadsToDownload.map(lead => lead.id);

      today = moment.tz(today, 'America/Guayaquil');
      const finalDownloadAt = '' + today.format('YYYY-MM-DD HH:mm:ss');
      await getConnection()
        .createQueryBuilder()
        .update(SourcedLead)
        .set({
          finalDownloadAt,
          status: LeadStatus.SIEBEL,
        })
        .where(`status = '${LeadStatus.CLEAN}'`)
        .andWhere('finalDownloadAt IS NULL')
        .andWhereInIds(leadsIds)
        .execute();

      return uploadResponse.publicURL;
      // TODO: save somewhere the fileurl?
    }

    return false;
  }

  /**
   * Process Sources Uploads File
   * @param filePath File Path
   * @param fileName File Name
   * @param campaignId Campaña
   * @param source Source
   */
  async sourcesToDatabase(
    filePath: string,
    fileName: string,
    campaignId: string,
    source: string,
  ) {
    let startingRow;
    switch (source) {
      case LeadSources.FACEBOOK:
      case LeadSources.DDP_FACEBOOK:
        startingRow = 3;
        break;
      case LeadSources.RRSS:
      case LeadSources.CALL_CENTER:
      case LeadSources.GENERIC:
        startingRow = 2;
        break;
    }
    let stream = await getXlsxStream({ filePath, sheet: 0 });
    const campaign = await this.campaignsService.findOne(campaignId);
    const lastLeadImported = await this.getLastImportedLeadDate(campaign);
    const { errors, errorFileHeaders } = await this.processSourcesRows(
      source,
      campaign,
      lastLeadImported,
      stream,
      startingRow,
      true, // Just Validate the data
    );
    // When there are errors, return the resulting file destination so it can be uploaded
    // and do not touch the database
    if (errors.length > 0) {
      const errorsFileDestination = `temp/errores-${fileName}`;
      await this.utilitiesService.createErrorsFile(
        errorsFileDestination,
        errors,
        errorFileHeaders,
      );
      return errorsFileDestination;
    }
    // When there is no error, upload the information to the database
    stream = await getXlsxStream({ filePath, sheet: 0 });
    await this.processSourcesRows(
      source,
      campaign,
      lastLeadImported,
      stream,
      startingRow,
      false, // Now allow saving to database
    );
    return null;
  }

  async processSourcesRows(
    source: string,
    campaign: Campaign,
    lastLeadImported,
    stream: Transform,
    startingRow: number,
    justValidate: boolean,
  ): Promise<{ errors: ValidationError[]; errorFileHeaders: string[] }> {
    let rowNumber = 0;
    let errorFileHeaders;
    const errors: ValidationError[] = [];
    for await (const line of stream) {
      rowNumber += 1;
      // Skip rows until we find the ones that have actual info
      if (rowNumber < startingRow) {
        if (rowNumber === startingRow - 1) {
          errorFileHeaders = ['Fila', 'Errores', ...line.formatted.arr];
        }
        continue;
      }

      try {
        const lead = await this.createLeadFromSourceRow(
          line.formatted.arr,
          source,
          campaign,
        );
        const lineErrors = await this.processImportSourceLead(
          lead,
          lastLeadImported,
          justValidate,
        );
        if (lineErrors && lineErrors.length) {
          errors.push({
            rowNumber,
            errors: lineErrors,
            row: line.formatted.arr,
          });
        }
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.log(rowNumber, line.formatted.arr);
        // tslint:disable-next-line:no-console
        console.error(e);
      }
    }
    return { errorFileHeaders, errors };
  }

  async createLeadFromSourceRow(
    row: string[],
    source: string,
    campaign: Campaign,
  ): Promise<Lead> {
    const newLead = new Lead();
    newLead.campaign = campaign;
    newLead.source = campaign.source;
    newLead.campaignName = campaign.name;
    switch (source) {
      case LeadSources.FACEBOOK:
        if (this.instanceSlug === 'ec') {
          newLead.date =
            row[1] && this.utilitiesService.parseDateString(row[1], true)
              ? this.utilitiesService.parseDateString(row[1])
              : null;
          newLead.email = row[8];
          newLead.names = row[9];
          newLead.lastNames = row[10];
          newLead.phone = row[7];
          newLead.cityName = row[4];
          newLead.document = this.utilitiesService.cleanDocument(
            row[2],
            this.instanceSlug,
          );
          newLead.dealerDealershipName = row[5];
          newLead.estimatedPurchaseDate = row[12];
          newLead.modelName = row[6];
        } else {
          newLead.date =
            row[1] && this.utilitiesService.parseDateString(row[1], true)
              ? this.utilitiesService.parseDateString(row[1])
              : null;
          newLead.email = row[6];
          newLead.names = row[7];
          newLead.lastNames = row[8];
          newLead.phone = row[5];
          newLead.cityName = row[3];
          newLead.modelName = row[10];
          newLead.document = this.utilitiesService.cleanDocument(
            row[2],
            this.instanceSlug,
          );
          newLead.dealerDealershipName = row[4];
          newLead.estimatedPurchaseDate = row[11];
        }
        break;
      case LeadSources.DDP_FACEBOOK:
        if (this.instanceSlug === 'ec') {
          newLead.date =
            row[1] && this.utilitiesService.parseDateString(row[1], true)
              ? this.utilitiesService.parseDateString(row[1])
              : null;
          newLead.email = row[8];
          newLead.names = row[9];
          newLead.lastNames = row[10];
          newLead.phone = row[7];
          newLead.cityName = row[4];
          newLead.document = this.utilitiesService.cleanDocument(
            row[2],
            this.instanceSlug,
          );
          newLead.dealerDealershipName = row[5];
          newLead.estimatedPurchaseDate = row[12];
          newLead.modelName = row[6];
        } else {
          newLead.date =
            row[1] && this.utilitiesService.parseDateString(row[1], true)
              ? this.utilitiesService.parseDateString(row[1])
              : null;
          newLead.email = row[6];
          newLead.names = row[7];
          newLead.lastNames = row[8];
          newLead.phone = row[5];
          newLead.cityName = row[3];
          newLead.modelName = row[10];
          newLead.document = this.utilitiesService.cleanDocument(
            row[2],
            this.instanceSlug,
          );
          newLead.dealerDealershipName = row[11];
          newLead.mobile = row[11];
          newLead.estimatedPurchaseDate = row[12];
        }
        break;
      case LeadSources.CALL_CENTER:
      case LeadSources.RRSS:
      case LeadSources.GENERIC:
        newLead.names = row[1];
        newLead.lastNames = row[2];
        newLead.email = row[5];
        newLead.phone = row[4];
        newLead.date =
          row[9] && parse(row[9], 'yyyy-MM-dd HH:mm:ss', new Date())
            ? parse(row[9], 'yyyy-MM-dd HH:mm:ss', new Date())
            : null;
        newLead.cityName = row[6];
        newLead.dealerDealershipName = row[7];
        newLead.document = this.utilitiesService.cleanDocument(
          row[3],
          this.instanceSlug,
        );
        newLead.mobile = row[4];
        newLead.estimatedPurchaseDate = row[10];
        newLead.otherComments = row[11];
        newLead.modelName = row[8];
        break;
    }
    return newLead;
  }

  async sourcedleadsByExternalForm(startDate, endDate, excelReport = false) {
    // get leads by external form
    const sourcedLeads = await this.getSourcedLeadsByExternalForm(
      startDate,
      endDate,
    );
    if (excelReport) {
      return await this.generateSourcedLeadsByExternalFormReport(sourcedLeads);
    }
    return sourcedLeads;
  }

  async getSourcedLeadsByExternalForm(startDate, endDate): Promise<any> {
    const sourcedLeads = await getConnection()
      .getRepository(SourcedLead)
      .createQueryBuilder('sl')
      .select('COUNT(sl.id)', 'numLeads')
      .addSelect('sl.externalFormName', 'formName')
      .addSelect('MAX(sl.date)', 'maxDate')
      .where('sl.externalId IS NOT NULL')
      .andWhere(`DATE_FORMAT(sl.date, '%Y-%m-%d') >= '${startDate}'`)
      .andWhere(`DATE_FORMAT(sl.date, '%Y-%m-%d') <= '${endDate}'`)
      .groupBy('sl.externalFormName')
      .orderBy('sl.externalFormName', 'ASC')
      .getRawMany();

    return sourcedLeads;
  }

  async generateSourcedLeadsByExternalFormReport(results: any) {
    if (results.length > 0) {
      const today = moment();
      const filename = `leads-by-form-${today.format(
        'YYYY-MM-DD_HH:mm:ss',
      )}.xlsx`;
      const fileLocation = `temp/${filename}`;
      const workbook = new Excel.stream.xlsx.WorkbookWriter({
        filename: fileLocation,
      });
      const worksheet = workbook.addWorksheet('Leads por formulario');

      worksheet.addRow(['Formulario', 'Leads', 'Ultima fecha registrada']);

      for (const sourcedLead of results) {
        const maxDate = moment.tz(sourcedLead.maxDate, 'America/Guayaquil');
        worksheet.addRow([
          sourcedLead.formName,
          sourcedLead.numLeads,
          maxDate.format('YYYY-MM-DD HH:mm:ss'),
        ]);
      }
      worksheet.commit();
      await workbook.commit();

      // Upload File to google
      const fileDestination = `downloads/leads-by-external-form/${filename}`;
      const filePath = `temp/${filename}`;
      const uploadResponse = await this.uploadsService.uploadAndGetPublicUrl(
        filePath,
        fileDestination,
      );

      return uploadResponse.publicURL;
    }
  }

  async findOneByEmailSentAtStatusAndDocument(
    fromDate: string,
    document: string,
    sentAtNotNull: boolean,
  ): Promise<SourcedLead | null> {
    const qb = await getConnection()
      .getRepository(SourcedLead)
      .createQueryBuilder('sl');
    qb.where(
      'sl.id IN ' +
        qb
          .subQuery()
          .select('f.sourcedLeadId')
          .from(Funnel, 'f')
          .where('f.leadId IS NULL')
          .getQuery(),
    );
    if (sentAtNotNull) {
      qb.andWhere('sl.emailSentAt IS NOT NULL');
    }
    const result = qb
      .andWhere('sl.createdAt >= :fromDate')
      .andWhere('sl.document = :document')
      .andWhere('sl.status = :status')
      .setParameter('fromDate', fromDate)
      .setParameter('document', document)
      .setParameter('status', LeadStatus.SIEBEL)
      .orderBy('sl.createdAt', 'DESC')
      .getOne();

    if (result) {
      return result;
    }
    return null;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { lastDayOfMonth, format, parse, subDays } from 'date-fns';
import * as Excel from 'exceljs';
import { getXlsxStream } from 'xlstream';

import { LiveStore } from './liveStore.entity';
import {
  CreateLiveStoreDto,
  UpdateLiveStoreDto,
  FilterLiveStoreDto,
} from './liveStore.dto';
import { Lead } from '../leads/lead.entity';
import { LeadsService } from '../leads/leads.service';
import { UsersService } from '../users/users.service';
import { AdvisersService } from './advisers/advisers.service';
import { UploadsService } from '../uploads/uploads.service';
import { TemporalLead } from './temporalLeads/temporalLead.entity';
import { LeadTypes } from '../funnels/funnel.entity';
import { UtilitiesService } from '../utilities/utilities.service';

type Row = string[];

export interface ValidationError {
  row: Row;
  rowNumber: number;
  errors: string[];
}
@Injectable()
export class LiveStoreService {
  private DATA_STARTS_AT_ROW = 2;
  constructor(
    @InjectRepository(LiveStore)
    private liveStoreRepo: Repository<LiveStore>,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(TemporalLead)
    private temporalLeadRepo: Repository<TemporalLead>,
    private leadsService: LeadsService,
    private usersService: UsersService,
    private advisersService: AdvisersService,
    private uploadsService: UploadsService,
    private utilitiesService: UtilitiesService,
  ) {}

  async findAll(params?: FilterLiveStoreDto) {
    await this.updateLeadWithTemporalLead();

    const searchQuery = this.liveStoreRepo
      .createQueryBuilder('ls')
      .innerJoinAndSelect('ls.lead', 'l')
      .leftJoinAndSelect('ls.user', 'u')
      .leftJoinAndSelect('ls.adviser', 'a')
      .innerJoin('l.dealerDealership', 'dd')
      .innerJoin('dd.dealerCity', 'dc')
      .innerJoin('dc.dealerGroup', 'dg');

    const searchQueryTempLeads = this.liveStoreRepo
      .createQueryBuilder('ls')
      .innerJoinAndSelect('ls.temporalLead', 'tl')
      .leftJoinAndSelect('ls.user', 'u')
      .leftJoinAndSelect('ls.adviser', 'a')
      .innerJoin('tl.dealerDealership', 'dd')
      .innerJoin('dd.dealerCity', 'dc')
      .innerJoin('dc.dealerGroup', 'dg');

    if (Object.keys(params).length !== 0) {
      const {
        interested,
        dealerGroupId,
        month,
        year,
        dealerManagementDate,
        virtualExperienceDate,
        virtualExperience,
        orderByName = false,
        userId = null,
        orderByVirtualExperienceDate = false,
        retrieveCallAgainLeads,
        limitLastTenDays,
      } = params;

      if (interested) {
        searchQuery.andWhere(`ls.isInterested = ${interested}`);
        searchQueryTempLeads.andWhere(`ls.isInterested = ${interested}`);
      }

      if (dealerGroupId) {
        if (`${dealerGroupId}` !== 'null' && dealerGroupId !== null) {
          searchQuery.andWhere(`dg.id = ${dealerGroupId}`);
          searchQueryTempLeads.andWhere(`dg.id = ${dealerGroupId}`);
        }
      }

      if (month && year) {
        const initDayRaw = new Date(year, month - 1, 1);
        const lastDayRaw = lastDayOfMonth(initDayRaw);
        const initDay = format(initDayRaw, 'yyyy-MM-dd');
        const lastDay = format(lastDayRaw, 'yyyy-MM-dd');
        searchQuery.andWhere(
          `ls.createdAt BETWEEN '${initDay} 00:00:00' AND '${lastDay} 23:59:59'`,
        );
        searchQueryTempLeads.andWhere(
          `ls.createdAt BETWEEN '${initDay} 00:00:00' AND '${lastDay} 23:59:59'`,
        );
      }

      if (dealerManagementDate)
        searchQuery.andWhere(`ls.dealerManagementDate IS NOT NULL`);

      if (limitLastTenDays) {
        const initDay = format(subDays(new Date(), 10), 'yyyy-MM-dd');
        const lastDay = format(new Date(), 'yyyy-MM-dd');
        searchQuery.andWhere(
          `ls.createdAt BETWEEN '${initDay} 00:00:00' AND '${lastDay} 23:59:5'`,
        );
      }

      if (virtualExperienceDate)
        searchQuery.andWhere(`ls.virtualExperienceDate IS NOT NULL`);

      if (retrieveCallAgainLeads) {
        // searchQuery.andWhere(`ls.virtualExperience = false`);
        searchQuery.andWhere(
          new Brackets(qb => {
            qb.where('ls.virtualExperience = false').andWhere(
              'ls.notVirtualExperienceReason IS NULL',
            );
          }),
        );
        searchQuery.orWhere(
          new Brackets(qb => {
            qb.where('ls.virtualExperience = false').andWhere(
              'ls.notVirtualExperienceReason = "Solicita volver a llamar"',
            );
          }),
        );
      } else {
        if (virtualExperience)
          searchQuery.andWhere(`ls.virtualExperience = ${virtualExperience}`);
      }

      if (userId) searchQuery.andWhere(`u.id = ${userId}`);

      if (orderByName) searchQuery.orderBy(`l.lastNames`, 'ASC');

      if (orderByVirtualExperienceDate)
        searchQuery.orderBy(`ls.virtualExperienceDate`, 'DESC');

      const normalLeads = await searchQuery.getMany();
      let temporalLeadsResponse = await searchQueryTempLeads.getMany();

      const temporalLeads = temporalLeadsResponse.map(temporalLead => ({
        ...temporalLead,
        lead: temporalLead.temporalLead,
      }));

      const test = [...normalLeads, ...temporalLeads];

      return [...normalLeads, ...temporalLeads];
    }

    return await this.liveStoreRepo.find();
  }

  async findOne(id: number) {
    const liveStore = await this.liveStoreRepo.findOne(id);
    if (!liveStore) throw new NotFoundException(`Live Store not found.`);
    return liveStore;
  }

  async findLead(mobileOrDocument: string) {
    const lead = await this.leadRepo
      .createQueryBuilder(`l`)
      .innerJoin(`l.funnels`, 'f')
      .innerJoin(`l.model`, 'm')
      .innerJoin(`l.dealerDealership`, 'dd')
      .where(`f.emailType = '${LeadTypes.LIVE_STORE}'`)
      .andWhere(
        new Brackets(subQuery => {
          subQuery.orWhere('l.mobile = :mobile', { mobile: mobileOrDocument });
          subQuery.orWhere('l.document = :document', {
            document: mobileOrDocument,
          });
          subQuery.orWhere('l.phone = :phone', { phone: mobileOrDocument });
          subQuery.orWhere('l.workPhone = :workPhone', {
            workPhone: mobileOrDocument,
          });
        }),
      )
      .orderBy('l.id', 'DESC')
      .getOne();

    const temporalLead = await this.temporalLeadRepo.findOne({
      where: [{ mobile: mobileOrDocument }, { document: mobileOrDocument }],
    });

    if (!lead && !temporalLead) throw new NotFoundException(`Lead not found.`);

    let liveStore: LiveStore;
    if (lead) {
      liveStore = await this.liveStoreRepo.findOne({
        where: {
          lead,
        },
        relations: ['lead', 'lead.model', 'lead.dealerDealership', 'user'],
      });
    } else {
      if (temporalLead) {
        liveStore = await this.liveStoreRepo.findOne({
          where: {
            temporalLead,
          },
          relations: ['temporalLead', 'user'],
        });
      }
    }

    if (liveStore) return liveStore;

    if (lead) return lead;

    if (temporalLead)
      return {
        ...temporalLead,
        id: null,
        temporalLeadId: temporalLead.id,
      };
  }

  // async getExpertLeads() {
  //   return await this.liveStoreRepo.createQueryBuilder('ls')
  //     .innerJoinAndSelect('ls.')
  // }

  async create(data: CreateLiveStoreDto) {
    const newLiveStore = this.liveStoreRepo.create(data);

    newLiveStore.managementDate = data.managementDate;

    if (data.leadId) {
      const lead = await this.leadsService.findOne(data.leadId);
      newLiveStore.lead = lead;
    }

    if (data.temporalLeadId) {
      const temporalLead = await this.temporalLeadRepo.findOne(
        data.temporalLeadId,
      );
      newLiveStore.temporalLead = temporalLead;
    }

    if (data.userId) {
      const user = await this.usersService.findOne(data.userId);
      newLiveStore.user = user;
    }

    return await this.liveStoreRepo.save(newLiveStore);
  }

  async update(id: number, changes: UpdateLiveStoreDto) {
    const liveStore = await this.findOne(id);
    this.liveStoreRepo.merge(liveStore, changes);

    if (changes.userId) {
      const user = await this.usersService.findOne(changes.userId);
      liveStore.user = user;
    }
    if (changes.userId === null) liveStore.user = null;

    if (changes.adviserId) {
      const adviser = await this.advisersService.findOne(changes.adviserId);
      liveStore.adviser = adviser;
    }
    if (changes.adviserId === null) liveStore.adviser = null;

    if (changes.leadAlreadyCreated && changes.leadId) {
      liveStore.temporalLead = null;
      const lead = await this.leadRepo.findOne(changes.leadId);
      liveStore.lead = lead;
    }

    return await this.liveStoreRepo.save(liveStore);
  }

  async remove(id: number) {
    return await this.liveStoreRepo.delete(id);
  }

  async downloadExcel(month: number, year: number, dealerGroupId: string) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Live Store');

    const liveStores = await this.findAll({
      month,
      year,
      dealerGroupId: dealerGroupId === 'null' ? null : parseInt(dealerGroupId),
      interested: true,
    });

    if (liveStores.length === 0) {
      throw new NotFoundException(`LiveStores not found.`);
    }

    worksheet.addRow([
      'Nombre Oportunidad',
      'Fecha Live Store',
      'RUT',
      'Nombre',
      'Apellido',
      'Teléfono',
      'Email',
      'Modelo',
      'Concesionario',
      'Experiencia Virtual',
      'Fecha de Gestión',
      'Intento de Llamada',
      'Contacto Efectivo',
      'Financiamiento',
      'Status',
      'Asesor Asignado',
      'Credito Pre-Aprobado',
    ]);

    for (const liveStore of liveStores) {
      const { lead } = liveStore;
      worksheet.addRow([
        lead.opportunityName,
        liveStore.managementDate,
        lead.document,
        lead.names,
        lead.lastNames,
        lead.mobile,
        lead.email,
        lead.modelName,
        lead.dealerDealershipName,
        liveStore.virtualExperience === true
          ? 'SI'
          : liveStore.virtualExperience === false
          ? 'NO'
          : '',
        liveStore.dealerManagementDate,
        liveStore.callAttempt === true
          ? 'SI'
          : liveStore.callAttempt === false
          ? 'NO'
          : '',
        liveStore.effectiveContact === true
          ? 'SI'
          : liveStore.effectiveContact === false
          ? 'NO'
          : '',
        liveStore.financing === true
          ? 'SI'
          : liveStore.financing === false
          ? 'NO'
          : '',
        liveStore.status,
        liveStore.adviser
          ? `${liveStore.adviser.name} ${liveStore.adviser.lastName}`
          : '',
        liveStore.preapprovedCredit === true
          ? 'SI'
          : liveStore.preapprovedCredit === false
          ? 'NO'
          : '',
      ]);
    }

    const fileName = `live-store-${Date.now()}.xlsx`;
    const fileDestination = `temp/${fileName}`;

    await workbook.xlsx.writeFile(fileDestination);

    const { publicURL } = await this.uploadsService.uploadAndGetPublicUrl(
      fileDestination,
      `uploads/live-store/downloads/${fileName}`,
    );

    await this.uploadsService.deleteFile(fileDestination);

    return publicURL;
  }

  async updateLeadWithTemporalLead() {
    // First I get all the temporal leads that are in the database
    const temporalLeads = await this.temporalLeadRepo.find();
    temporalLeads.map(async temporalLead => {
      const { opportunityName } = temporalLead;

      // and start to compare each of them
      const lead = await this.leadRepo.findOne({
        where: {
          opportunityName,
        },
      });

      // If there is a lead on Leads table with the same opName I make the changes
      if (lead) {
        // Get the LiveStore created with that OpName
        const liveStores = await this.liveStoreRepo
          .createQueryBuilder('ls')
          .innerJoinAndSelect('ls.temporalLead', 'tl')
          .andWhere(`tl.opportunityName = '${opportunityName}'`)
          .getMany();

        // Update the LiveStore table with the Lead id
        await this.update(liveStores[0].id, {
          leadAlreadyCreated: true,
          leadId: lead.id,
        });

        // And finally I delete the temp Lead
        await this.temporalLeadRepo.delete(temporalLead.id);
      }
    });
  }

  async downloadGMFExcel(month: number, year: number, dealerGroupId: string) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Live Store');

    const liveStores = await this.findAll({
      month,
      year,
      dealerGroupId: dealerGroupId === 'null' ? null : parseInt(dealerGroupId),
      interested: true,
    });

    if (liveStores.length === 0)
      throw new NotFoundException(`LiveStores not found.`);

    worksheet.addRow([
      'Nombre Oportunidad',
      'Fecha de Gestión Live Store',
      'RUT',
      'Nombre',
      'Apellido',
      'Teléfono',
      'Email',
      'Modelo',
      'Concesionario',
      'Interes en Evaluacion de Financiamiento',
      '*Numero de Serie RUT',
      'Fecha de Nacimiento',
      'Estado Civil ',
      'Tipo de Cliente ',
      'Numero de Años Empleador actual',
      'Numero de Meses Empleador actual',
      'Ingresos Mensuales $',
      'Version',
      'Pie ( $ / %)',
      'Plan',
      'Plazo (6 a 60 meses)',
      'Experiencia Virtual',
      'Credito Pre-Aprobado',
    ]);

    for (const liveStore of liveStores) {
      const { lead } = liveStore;
      worksheet.addRow([
        lead.opportunityName,
        format(liveStore.managementDate, 'dd/MM/yyyy HH:mm:ss'),
        lead.document,
        lead.names,
        lead.lastNames,
        lead.mobile,
        lead.email,
        lead.modelName,
        lead.dealerDealershipName,
        liveStore.isInterestedInFinancing === true
          ? 'SI'
          : liveStore.isInterestedInFinancing === false
          ? 'NO'
          : '',
        liveStore.serieRUT,
        liveStore.birthDate,
        liveStore.maritalStatus,
        liveStore.clientType,
        liveStore.yearsOnCurrentJob,
        liveStore.monthsOnCurrentJob,
        liveStore.monthlyIncome,
        liveStore.version,
        liveStore.threshold,
        liveStore.plan,
        liveStore.deadline,
        liveStore.virtualExperience === true
          ? 'SI'
          : liveStore.virtualExperience === false
          ? 'NO'
          : '',
        liveStore.preapprovedCredit === true
          ? 'SI'
          : liveStore.preapprovedCredit === false
          ? 'NO'
          : '',
      ]);
    }

    const fileName = `live-store-${Date.now()}.xlsx`;
    const fileDestination = `temp/${fileName}`;

    await workbook.xlsx.writeFile(fileDestination);

    const { publicURL } = await this.uploadsService.uploadAndGetPublicUrl(
      fileDestination,
      `uploads/live-store/downloads/${fileName}`,
    );

    await this.uploadsService.deleteFile(fileDestination);

    return publicURL;
  }

  async uploadGMF(filePath: string, fileName: string) {
    // Upload the Excel file to Google
    try {
      await this.uploadsService.uploadToGoogle(
        filePath,
        `uploads/objectives-and-results/${fileName}`,
      );
    } catch (e) {
      console.error(e);
    }

    let stream = await getXlsxStream({ filePath, sheet: 0 });
    let currentRow = 1;
    const errors: ValidationError[] = [];
    for await (const line of stream) {
      if (currentRow >= this.DATA_STARTS_AT_ROW) {
        await this.updateGMF(line.formatted.obj);
      }
      currentRow++;
    }

    await this.uploadsService.deleteFile(filePath);

    return errors.length > 0
      ? errors
      : `Objectives/Results uploaded successfully.`;
  }

  // async validateRow(row: any) {
  //   const rowErrors: string[] = [];
  //   const {
  //     A: objectiveResultsIdentifier = null,
  //     B: month = null,
  //     C: year = null,
  //   } = row;

  //   try {
  //     if (objectiveResultsIdentifier === null) {
  //       rowErrors.push(`El Identificador del participante es obligatorio.`);
  //     }
  //     if (month === null) {
  //       rowErrors.push(`El mes del objectivo/resultado es obligatorio.`);
  //     } else {
  //       if (isNaN(month)) rowErrors.push(`El mes debe ser un número`);
  //     }
  //     if (year === null) {
  //       rowErrors.push(`El año del objectivo/resultado es obligatorio.`);
  //     } else {
  //       if (isNaN(year)) rowErrors.push(`El año debe ser un número`);
  //     }

  //     // To finish the validation I have to loop through the KPI's info
  //     // to validate if all that data are well.
  //     // I have to do it in a loop, because the SystemUser can upload just One KPI or
  //     // thousands for the same Participant
  //     /*
  //       A 'triad' is composed by 3 items:
  //       1) The KPI ID
  //       2) The Objective (optional)
  //       3) The Result (optional)
  //       All the triads corresponds to THE SAME month and year and for THE SAME participant
  //     */
  //     let triad = 1;
  //     let columnNumber = 1;
  //     for (let test in row) {
  //       // Extract the current value of the cell
  //       const currentValue = row[test];
  //       // Skip the first columns, until I get the KPI's information
  //       if (columnNumber >= 3) {
  //         // The pointer is located at the KPI id
  //         if (triad === 1) {
  //           if (currentValue === null) {
  //             rowErrors.push(`El ID del KPI es obligatorio.`);
  //           } else {
  //             if (isNaN(currentValue))
  //               rowErrors.push(`Debe poner el ID del KPI. No el nombre.`);
  //           }
  //         }

  //         // The pointer is located at the Objective
  //         if (triad === 2) {
  //           if (currentValue !== null && isNaN(currentValue))
  //             rowErrors.push(`El objetivo debe ser un número.`);
  //         }

  //         // The pointer is located at the Result
  //         if (triad === 3) {
  //           if (currentValue !== null && isNaN(currentValue))
  //             rowErrors.push(`El resultado debe ser un número.`);
  //         }

  //         triad++;
  //         // Once the triad is full I reset it again to 1
  //         if (triad === 4) triad = 1;
  //       }
  //       columnNumber++;
  //     }
  //   } catch (e) {
  //     return [`Error de formato en toda la línea.`];
  //   }

  //   return rowErrors;
  // }

  async updateGMF(row: any) {
    const { A: opportunityName = null, U: preapprovedCreditRaw = '' } = row;

    if (opportunityName && preapprovedCreditRaw) {
      const currentLiveStores = await this.liveStoreRepo
        .createQueryBuilder('ls')
        .innerJoinAndSelect('ls.lead', 'l')
        .andWhere(`l.opportunityName = '${opportunityName}'`)
        .getMany();

      if (currentLiveStores[0]) {
        const preapprovedCredit = preapprovedCreditRaw
          ? `${preapprovedCreditRaw}`.toUpperCase()
          : '';

        if (
          preapprovedCredit === 'SI' ||
          preapprovedCredit == 'TRUE' ||
          preapprovedCredit === '1'
        ) {
          return await this.update(currentLiveStores[0].id, {
            preapprovedCredit: true,
          });
        }

        if (
          preapprovedCredit === 'NO' ||
          preapprovedCredit === 'FALSE' ||
          preapprovedCredit === '0'
        ) {
          return await this.update(currentLiveStores[0].id, {
            preapprovedCredit: false,
          });
        }
      }
    }
  }

  async liveStoreToDatabase(
    filePath: string,
    fileName: string,
    year: number,
    month: number,
    taskId: number,
  ) {
    const errors: ValidationError[] = [];
    const dataStartsAtRow = 2;
    let rowNumber = 1;
    // Create a stream to read the file
    let stream = await getXlsxStream({ filePath, sheet: 0 });
    for await (const line of stream) {
      if (rowNumber >= dataStartsAtRow && line.formatted.arr.length !== 0) {
        const rowErrors = await this.validateRow(
          line.formatted.obj,
          year,
          month,
        );
        if (rowErrors.length > 0) {
          errors.push({
            rowNumber,
            errors: rowErrors,
            row: line.formatted.arr,
          });
        }
      }
      rowNumber += 1;
    }

    // When there are errors, return the resulting file destination so it can be uploaded
    // and do not touch the database
    if (errors.length > 0) {
      const errorsFileDestination = `temp/errores-${fileName}`;
      await this.createErrorsFile(errorsFileDestination, errors);
      return errorsFileDestination;
    }

    stream = await getXlsxStream({ filePath, sheet: 0 });
    rowNumber = 1;
    for await (const line of stream) {
      if (rowNumber >= dataStartsAtRow && line.formatted.arr.length !== 0) {
        await this.createFromRow(line.formatted.obj, year, month, taskId);
      }
      rowNumber += 1;
    }
    return null;
  }

  async validateRow(row: any, year: number, month: number): Promise<string[]> {
    const rowErrors: string[] = [];
    const {
      A: opportunityName = null,
      K: dealerManagementDate = null,
      L: callAttempt = null,
      M: effectiveContact = null,
      N: financing = null,
      O: status = null,
      P: adviserName = null,
    } = row;

    try {
      // Validate OpName
      if (!opportunityName) {
        rowErrors.push('El Nombre de Oportunidad es obligatorio');
      } else {
        const liveStore = await this.getLiveStoreRecordBasedOnOpName(
          opportunityName,
        );
        if (!liveStore)
          rowErrors.push(
            `No existe un Nombre de Oportunidad con el nombre ${opportunityName}`,
          );
      }

      // Validate Dealer Management Date
      const resultDate = parse(dealerManagementDate, 'MM/dd/yyyy', new Date());
      if (resultDate.toString() === 'Invalid Date')
        rowErrors.push(
          'Fecha de Gestión debe estar en el formato mes/día/año.',
        );

      // Validate Call Attempt
      if (callAttempt && callAttempt != 'SI' && callAttempt != 'NO')
        rowErrors.push('Intento de Llamada debe ser SI o NO o vacío.');

      // Validate Effective Contact
      if (
        effectiveContact &&
        effectiveContact != 'SI' &&
        effectiveContact != 'NO'
      )
        rowErrors.push('Contacto Efectivo debe ser SI o NO o vacío.');

      // Validate Financing
      if (financing && financing != 'SI' && financing != 'NO')
        rowErrors.push('Financiamiento debe ser SI o NO o vacío.');

      // Validate Status
      if (
        status != 'EN SEGUIMIENTO' &&
        status != 'COTIZACION ENVIADA' &&
        status != 'PROGRAMO VISITA AL DEALER' &&
        status != 'DESISTE DE LA COMPRA' &&
        status != 'POSTERGA LA COMPRA' &&
        status != 'NO CONTESTA'
      )
        rowErrors.push(
          'Status debe ser EN SEGUIMIENTO, COTIZACION ENVIADA, PROGRAMO VISITA AL DEALER, DESISTE DE LA COMPRA, POSTERGA LA COMPRA o NO CONTESTA.',
        );

      // Validate Adviser
      const adviser = await this.advisersService.getAdviserBasedOnFullName(
        adviserName,
      );
      if (!adviser)
        rowErrors.push(`No existe un Asesor con el nombre ${adviserName}`);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return ['Error de formato con toda la línea'];
    }
    return rowErrors;
  }

  async getLiveStoreRecordBasedOnOpName(opportunityName: string) {
    return await this.liveStoreRepo
      .createQueryBuilder('ls')
      .innerJoinAndSelect('ls.lead', 'l')
      .andWhere(`l.opportunityName = '${opportunityName}'`)
      .getOne();
  }

  async createErrorsFile(fileDestination: string, errors: ValidationError[]) {
    const workbook = new Excel.stream.xlsx.WorkbookWriter({
      filename: fileDestination,
    });
    const worksheet = workbook.addWorksheet('Errores');
    worksheet.addRow(['Fila', 'Errores']);
    for (const err of errors) {
      worksheet.addRow([err.rowNumber, err.errors.join(' '), ...err.row]);
    }
    worksheet.commit();
    await workbook.commit();
  }

  async createFromRow(row: any, year: number, month: number, taskId: number) {
    const {
      A: opportunityName = null,
      K: dealerManagementDate = null,
      L: callAttempt = null,
      M: effectiveContact = null,
      N: financing = null,
      O: status = null,
      P: adviserName = null,
    } = row;

    const liveStore = await this.getLiveStoreRecordBasedOnOpName(
      opportunityName,
    );

    if (!liveStore) return;

    const resultDate = parse(dealerManagementDate, 'MM/dd/yyyy', new Date());
    liveStore.dealerManagementDate = resultDate;

    if (callAttempt)
      liveStore.callAttempt = callAttempt === 'SI' ? true : false;

    if (effectiveContact)
      liveStore.effectiveContact = effectiveContact === 'SI' ? true : false;

    if (financing) liveStore.financing = financing === 'SI' ? true : false;

    liveStore.status = status;

    liveStore.adviser = await this.advisersService.getAdviserBasedOnFullName(
      adviserName,
    );

    await this.liveStoreRepo.save(liveStore);
  }
}

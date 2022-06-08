import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import {
  NotContactedLeads,
  ValidationStatus,
  JustificationObservation,
} from './notContactedLeads.entity';
import { getXlsxStream } from 'xlstream';
import * as Excel from 'exceljs';
import { ConfigService } from '@nestjs/config';
import { parse, format } from 'date-fns';
import { TasksService } from 'modules/tasks/tasks.service';
import { TaskTypes } from '../tasks/task.entity';
import { DealerDealershipsService } from '../dealers/dealerDealerships.service';
import { NotContactedLeadsAttachmentsService } from './attachments/attachments.service';
import { UploadsService } from 'modules/uploads/uploads.service';
import { Lead } from '../leads/lead.entity';

type Row = string[];

interface ValidationError {
  row: Row;
  rowNumber: number;
  errors: string[];
}

@Injectable()
export class NotContactedLeadsService extends TypeOrmCrudService<
  NotContactedLeads
> {
  instanceSlug: string;
  instanceName: string;
  opNames: string[] = [];
  constructor(
    @InjectRepository(NotContactedLeads) repo,
    private configService: ConfigService,
    @Inject(forwardRef(() => TasksService))
    private tasksService: TasksService,
    private dealerDealersipService: DealerDealershipsService,
    private attachmentsService: NotContactedLeadsAttachmentsService,
    private uploadsService: UploadsService,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
  ) {
    super(repo);
    this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
    this.instanceName = this.configService.get('GM_INSTANCE_NAME');
  }
  async validateRow(row: any, year: number, month: number): Promise<string[]> {
    const rowErrors: string[] = [];
    const {
      A: rowYear = null,
      B: rowMonthFull = null,
      C: country = null,
      D: bacCode = null,
      H: lastMamagementDate = null,
      I: lastManagementHour = null,
      M: opportunityName = null,
      O: satisfactionLevel = null,
      S: wantAnotherDealer = null,
      U: notContacted = null,
      V: daysApart = null,
    } = row;

    try {
      if (rowYear === null || rowMonthFull === null) {
        rowErrors.push('Año y mes del lead es requerido.');
      } else {
        const monthSplitted = rowMonthFull.split(' '); // The format comes as "04 - Abril"
        const rowMonth = parseInt(monthSplitted[0]); // So, I separate the month number
        if (parseInt(rowYear) !== year || rowMonth !== month) {
          rowErrors.push(
            'Fecha del lead debe coincidir con el año y mes seleccionado.',
          );
        }
      }
      // First I remove the accents of the country to compare
      if (
        country.normalize('NFD').replace(/[\u0300-\u036f]/g, '') !==
        this.instanceName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      ) {
        // if (country !== this.instanceName) {
        rowErrors.push(
          `Todos los registros solo deben corresponder al país ${this.instanceName}.`,
        );
      }
      if (bacCode === null) {
        rowErrors.push('Código BAC es requerido.');
      }
      if (lastMamagementDate === null || lastManagementHour === null) {
        rowErrors.push('Fecha y hora de la última gestión es requerido.');
      }
      if (opportunityName === null) {
        rowErrors.push('Nombre de oportunidad es requerido.');
      }
      if (opportunityName === null) {
        rowErrors.push('Nombre de oportunidad es requerido.');
      } else {
        // This would help me to validate duplicated OpNames
        this.opNames.push(opportunityName);
      }
      if (satisfactionLevel !== null) {
        if (isNaN(satisfactionLevel)) {
          //  // returns true if the variable does NOT contain a valid number
          rowErrors.push('El nivel de satisfacción debe ser un número.');
        }
      }
      if (wantAnotherDealer !== null) {
        if (wantAnotherDealer !== 'SI' && wantAnotherDealer !== 'NO') {
          rowErrors.push(
            'Desea ser contactado por otro dealer debe ser SI o NO',
          );
        }
      }
      if (notContacted === null) {
        rowErrors.push(
          'Colocar si el Opp está o no contactado en forma de 0 o 1.',
        );
      } else {
        if (isNaN(notContacted)) {
          //  // returns true if the variable does NOT contain a valid number
          rowErrors.push('Debe ser 0 o 1');
        }
      }
      if (daysApart === null) {
        rowErrors.push('Los días de diferencia son requeridos.');
      } else {
        if (isNaN(daysApart)) {
          //  // returns true if the variable does NOT contain a valid number
          rowErrors.push('Debe ser un número');
        }
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return ['Error de formato con toda la línea'];
    }
    return rowErrors;
  }

  validateDuplicatedOpNames(opNames: string[]) {
    return opNames.length !== new Set(opNames).size;
  }

  async createFromRow(row: any, year: number, month: number, taskId: number) {
    const {
      D: bacCode = null,
      G: observations = null,
      H: lastMamagementDate = null,
      I: lastManagementHour = null,
      M: opportunityName = null,
      O: satisfactionLevel = null,
      P: means = null,
      Q: timeToTakeContact = null,
      R: keyWord = null,
      S: wantAnotherDealer = null,
      T: notContactedReason = null,
      U: notContacted = null,
      V: daysApart = null,
    } = row;

    const newNotContactedLead = this.repo.create();

    // dealerGroupId would help then to get just the NCL related to the user GroupDealershipId
    const { dealerCity } = await this.dealerDealersipService.findByBac(bacCode);
    const dealerGroupId = dealerCity.dealerGroup.id;

    const attachments = await this.attachmentsService.getAttachmentsByOpName(
      opportunityName,
    );
    if (attachments.length > 0) {
      // If this, is because this OpName was before, and also someone upload files related to this one
      const attachment = attachments[0];
      newNotContactedLead.status = attachment.status;
      newNotContactedLead.justificationDate = new Date(
        attachment.createdAt.toString(),
      );
      newNotContactedLead.justificationObservation =
        attachment.justificationObservation;
    }

    newNotContactedLead.year = year;
    newNotContactedLead.month = month;
    newNotContactedLead.bac = bacCode;
    newNotContactedLead.dealerGroupId = dealerGroupId;
    newNotContactedLead.observations = observations;
    newNotContactedLead.opportunityName = opportunityName;
    newNotContactedLead.satisfactionLevel = satisfactionLevel;
    newNotContactedLead.means = means;
    newNotContactedLead.timeToTakeContact = timeToTakeContact;
    newNotContactedLead.wantAnotherDealer =
      wantAnotherDealer === 'SI' ||
      wantAnotherDealer === 'Si' ||
      wantAnotherDealer === 'si'
        ? true
        : false;
    newNotContactedLead.notContactedReason = notContactedReason;
    newNotContactedLead.notContacted = notContacted;
    newNotContactedLead.daysApart = daysApart;
    newNotContactedLead.taskId = taskId;
    newNotContactedLead.keyWord = keyWord;

    if (lastManagementHour !== null) {
      const splittedHour = lastManagementHour.split(':');
      const newDate = parse(lastMamagementDate, 'dd/MM/yyyy', new Date());
      newDate.setHours(
        parseInt(splittedHour[0]),
        parseInt(splittedHour[1]),
        parseInt(splittedHour[2]),
      );
      newNotContactedLead.lastManagementDate = newDate;
      newNotContactedLead.lastManagementHour = newDate;
    }

    await this.repo.save(newNotContactedLead);
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

  async notContactedLeadsToDatabase(
    filePath: string,
    fileName: string,
    year: number,
    month: number,
    taskId: number,
  ) {
    const errors: ValidationError[] = [];
    this.opNames = [];
    const dataStartsAtRow = 3;
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
    const areDuplicatedOpNames = this.validateDuplicatedOpNames(this.opNames);
    if (areDuplicatedOpNames) {
      errors.push({
        rowNumber: 0,
        errors: ['El archivo contiene OpportunityNames duplicados.'],
        row: ['opportunityNames'],
      });
    }
    // When there are errors, return the resulting file destination so it can be uploaded
    // and do not touch the database
    if (errors.length > 0) {
      const errorsFileDestination = `temp/errores-${fileName}`;
      await this.createErrorsFile(errorsFileDestination, errors);
      return errorsFileDestination;
    }

    // When there is no error, upload the information to the database
    // but first, delete all the past records for that month / year
    await this.repo.delete({ year, month });
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

  async getNotContactedLeads(
    year: number,
    month: number,
    dealerGroupId: string,
  ) {
    let searchQuery = this.repo.createQueryBuilder('ncl');

    dealerGroupId === 'null'
      ? searchQuery
          .where(`ncl.year = '${year}'`)
          .andWhere(`ncl.month = '${month}'`)
      : searchQuery
          .where(`ncl.year = '${year}'`)
          .andWhere(`ncl.month = '${month}'`)
          .andWhere(`ncl.dealerGroupId = '${dealerGroupId}'`);

    searchQuery
      .leftJoinAndSelect(Lead, 'l', 'ncl.opportunityName = l.opportunityName')
      .leftJoin(
        `ncl.attachment`,
        'ncla',
        'ncl.opportunityName = ncla.opportunityName',
      )
      .select([
        'ncl.id',
        'ncl.year',
        'ncl.month',
        'ncl.bac',
        'ncl.opportunityName',
        'ncl.notContacted',
        'ncl.status',
        'ncl.justificationDate',
        'ncl.justificationObservation',
        'l.document',
        'ncla.filePath',
        'ncla.fileName',
      ]);

    const notContactedLeads = await searchQuery.getMany();

    const notContactedLeadsWithDocument = [];

    for (const notContactedLead of notContactedLeads) {
      const lead = await this.leadRepo.findOne({
        where: {
          opportunityName: notContactedLead.opportunityName,
        },
      });
      notContactedLeadsWithDocument.push({
        ...notContactedLead,
        document: lead ? lead.document : '',
      });
    }

    if (notContactedLeadsWithDocument.length === 0) {
      throw new HttpException(
        'NotContactedLead not founded',
        HttpStatus.NO_CONTENT,
      );
    }
    return notContactedLeadsWithDocument;
  }

  async getLatestUploads(toObtain: number) {
    const tasks = await this.tasksService.getCertainNumberOfTasks(
      toObtain,
      TaskTypes.CONTACTABILITY_UPLOAD,
    );
    const tasksWithOpCount = tasks.map(async task => {
      const taskId = task.Task_id;
      const counter = await this.repo
        .createQueryBuilder()
        .select()
        .where(`taskId = ${taskId}`)
        .getCount();
      return {
        ...task,
        counter,
      };
    });
    return Promise.all(tasksWithOpCount);
  }

  async getNotContactedLead(opName: string) {
    return await this.repo
      .createQueryBuilder()
      .select()
      .where(`opportunityName = '${opName}'`)
      .getOne();
  }

  async updateStatus(
    opName: string,
    status: ValidationStatus,
    justificationDate: Date | null,
  ) {
    const currentDate = format(new Date(), 'yyyy-MM-dd HH-mm-ss');

    return await this.repo
      .createQueryBuilder()
      .update()
      .where(`opportunityName = '${opName}'`)
      .set({
        status: () => `'${status}'`,
        justificationDate: () =>
          !justificationDate
            ? `'${currentDate}'`
            : `'${format(justificationDate, 'yyyy-MM-dd HH-mm-ss')}'`,
      })
      .execute();
  }

  async generateExcel(year: number, month: number, dealerGroupId: string) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Leads No Contactados');

    const searchQuery = this.repo
      .createQueryBuilder('ncl')
      .andWhere(`ncl.month = ${month}`)
      .andWhere(`ncl.year = ${year}`);

    if (dealerGroupId !== 'null')
      searchQuery.andWhere(`ncl.dealerGroupId = ${dealerGroupId}`);

    const notContactedLeads = await searchQuery.getMany();

    if (notContactedLeads.length === 0) {
      throw new HttpException(
        'NotContactedLead not founded',
        HttpStatus.NO_CONTENT,
      );
    }

    worksheet.addRow([
      'Año',
      'Mes',
      'BAC',
      'Nombre de Oportunidad',
      'Campaña',
      'Fecha de creación de Lead',
      'Celular',
      'Correo Electrónico',
      'Punto de Venta',
      'Dealer Ciudad',
      'Fecha última de gestión',
      'Hora última de gestión',
      'No Contactado',
      'SI ¿Qué tan satisfecho se encuentra con la atención recibida por el concesionario?  Siendo 0 nada sa',
      'Observaciones',
      'Palabra Clave',
      'Medio',
      'SI ¿En cuánto tiempo fue contactado?',
      'NO ¿Desea ser contactado por otro concesionario, para seguir su proceso de compra?',
      'NO . ¿Cuál de las siguientes opciones, representa de mejor manera, la respuesta brindada anteriormen',
      'Dias Diferencia',
      'Status',
      'Fecha de Justificación',
      'Razón no Aprobado',
    ]);

    for (const notContactedLead of notContactedLeads) {
      const lead = await this.leadRepo.findOne({
        where: {
          opportunityName: notContactedLead.opportunityName,
        },
        relations: ['dealerDealership', 'dealerDealership.dealerCity'],
      });
      worksheet.addRow([
        notContactedLead.year,
        notContactedLead.month,
        notContactedLead.bac,
        notContactedLead.opportunityName,
        lead ? lead.campaignName : '',
        lead ? lead.creationDate : '',
        lead ? lead.mobile : '',
        lead ? lead.email : '',
        lead ? lead.dealerDealershipName : '',
        lead ? lead.dealerDealership.dealerCity.name : '',
        notContactedLead.lastManagementDate,
        notContactedLead.lastManagementHour,
        notContactedLead.notContacted,
        notContactedLead.satisfactionLevel,
        notContactedLead.observations,
        notContactedLead.keyWord,
        notContactedLead.means,
        notContactedLead.timeToTakeContact,
        notContactedLead.wantAnotherDealer,
        notContactedLead.notContactedReason,
        notContactedLead.daysApart,
        notContactedLead.status,
        notContactedLead.justificationDate,
        notContactedLead.justificationObservation,
      ]);
    }

    const fileName = `leads-no-contactados-${Date.now()}.xlsx`;
    const fileDestination = `temp/${fileName}`;

    await workbook.xlsx.writeFile(fileDestination);

    const { publicURL } = await this.uploadsService.uploadAndGetPublicUrl(
      fileDestination,
      `uploads/not-contacted-leads-uploads/downloads/${fileName}`,
    );

    await this.uploadsService.deleteFile(fileDestination);

    return publicURL;
  }

  async updateAllStatus(
    opName: string,
    status: ValidationStatus,
    justificationObservation: JustificationObservation,
  ) {
    const justificationObserVationString = justificationObservation as string;

    await this.attachmentsService.updateStatus(
      opName,
      status,
      justificationObservation,
    );

    return await this.repo
      .createQueryBuilder()
      .update()
      .where(`opportunityName = '${opName}'`)
      .set({
        status: () => `'${status}'`,
        justificationObservation: () =>
          justificationObserVationString === 'null'
            ? `null`
            : `'${justificationObservation}'`,
      })
      .execute();
  }
}

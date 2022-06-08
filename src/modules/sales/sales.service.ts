import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { getConnection } from 'typeorm';
import { Sale } from './sale.entity';
import {
  endOfMonth,
  subDays,
  endOfDay,
  startOfDay,
  add,
  setDay,
  format,
} from 'date-fns';
import { Between } from 'typeorm';
import { getXlsxStream } from 'xlstream';
import { DealerDealershipsService } from 'modules/dealers/dealerDealerships.service';
import { ModelsService } from 'modules/models/models.service';
import { CitiesService } from 'modules/cities/cities.service';
import * as Excel from 'exceljs';
import { LeadsService } from 'modules/leads/leads.service';
import { DealerGroup } from 'modules/dealers/dealerGroup.entity';
import { UtilitiesService } from 'modules/utilities/utilities.service';
import { ConfigService } from '@nestjs/config';
import moment = require('moment-timezone');
import { SalesAssignationsService } from './salesAssignations/salesAssignations.service';
import { SalesAssignation } from './salesAssignations/saleAssignation.entity';

type Row = string[];

interface ValidationError {
  row: Row;
  rowNumber: number;
  errors: string[];
}

@Injectable()
export class SalesService extends TypeOrmCrudService<Sale> {
  instanceSlug: string;
  private readonly logger = new Logger(Sale.name);

  constructor(
    @InjectRepository(Sale) repo,
    private dealersService: DealerDealershipsService,
    private modelsService: ModelsService,
    private citiesService: CitiesService,
    private leadsService: LeadsService,
    private utilitiesService: UtilitiesService,
    private configService: ConfigService,
    private salesAssignationsService: SalesAssignationsService,
  ) {
    super(repo);
    this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
  }
  async validateRow(row: Row): Promise<string[]> {
    const rowErrors: string[] = [];
    const [
      vin,
      couponNumber,
      validation,
      registerDate,
      zoneName,
      region,
      province,
      dealership,
      dealerDealershipName,
      dealershipBac,
      reportsDate,
      days,
      zvks,
      my,
      kmat,
      modelName,
      aeade,
      segment,
      family,
      vehicleType,
      color,
      keySaleType,
      validFleet,
      cancellationDate,
      retailInvoiceDate,
      financeType,
      paymentMethod,
      leasingFinancial,
      salesmanDocument,
      salesman,
      couponStatus,
      retailInvoiceNumber,
      chevystar,
      keyFleet,
      netValue,
      totalValue,
      salesType,
      vehicleUse,
      zone2,
      deliveryDate,
      createdBy,
      createdDate,
      previousVehicleBrand,
      previousVehicleModel,
      previousVehicleYear,
      cancellationCause,
      insuranceCompany,
      businessName,
      document,
      contact,
      gender,
      birthDate,
      phone,
      homePhone,
      mobile,
      address,
      email,
      cityName,
      country,
      vehicleYear,
      dealershipCode,
      dealershipId,
      duplicated,
    ] = row;
    try {
      const dealerDealership = await this.dealersService.findByBacOrNameAlias(
        dealershipBac,
        dealerDealershipName,
      );
      // don't upload dealer ignored
      if (
        dealerDealership &&
        dealerDealership.dealerCity &&
        dealerDealership.dealerCity.ignore
      ) {
        return [];
      }

      if (!vin) {
        rowErrors.push('No identificación del vehículo es requerido.');
      }
      if (`${validation}` !== '-1' && `${validation}` !== '1') {
        rowErrors.push('Validación debe ser 1 o -1.');
      }
      if (dealershipBac || dealerDealershipName) {
        if (!dealerDealership) {
          rowErrors.push('No se encontró un Concesionario para esa Cuenta.');
        }
      }
      if (modelName) {
        const model = await this.modelsService.findByNameOrAlias(modelName);
        if (!model) {
          rowErrors.push(
            'Descripción no coincide con ningún modelo registrado.',
          );
        }
      }
      if (
        this.utilitiesService
          .parseMDYDateString(retailInvoiceDate)
          .toString() === 'Invalid Date'
      ) {
        rowErrors.push(
          'Fecha de la factura Retail debe estar en el formato mes/día/año.',
        );
      }
      if (!document) {
        rowErrors.push('Documento (Cédula de identificación) es requerido.');
      }
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return ['Error de formato con toda la línea'];
    }
    return rowErrors;
  }
  async createFromRow(row: Row, year: number, month: number) {
    const [
      vin,
      couponNumber,
      validation,
      registerDate,
      zoneName,
      region,
      province,
      dealership,
      dealerDealershipName,
      dealershipBac,
      reportsDate,
      days,
      zvks,
      my,
      kmat,
      modelName,
      aeade,
      segment,
      family,
      vehicleType,
      color,
      keySaleType,
      validFleet,
      cancellationDate,
      retailInvoiceDate,
      financeType,
      paymentMethod,
      leasingFinancial,
      salesmanDocument,
      salesman,
      couponStatus,
      retailInvoiceNumber,
      chevystar,
      keyFleet,
      netValue,
      totalValue,
      salesType,
      vehicleUse,
      zone2,
      deliveryDate,
      createdBy,
      createdDate,
      previousVehicleBrand,
      previousVehicleModel,
      previousVehicleYear,
      cancellationCause,
      insuranceCompany,
      businessName,
      document,
      contact,
      gender,
      birthDate,
      phone,
      homePhone,
      mobile,
      address,
      email,
      cityName,
      country,
      vehicleYear,
      dealershipCode,
      dealershipId,
      duplicated,
    ] = row;
    const newSale = this.repo.create();
    let isValid = true;
    let isValidOverall = true;

    newSale.dealership = dealership;
    newSale.dealershipBac = dealershipBac;
    newSale.dealerDealership = await this.dealersService.findByBacOrNameAlias(
      dealershipBac,
      dealerDealershipName,
    );

    // don't upload dealer ignored
    if (newSale.dealerDealership.dealerCity.ignore) {
      return;
    }

    // find a valid sale with the same vin for club presidente
    const pastValidSale = await this.repo.findOne({ vin, isValid: true });
    if (pastValidSale) {
      // if a past sale is present, then mark this one as invalid
      isValid = false;
    }

    // find a valid sale with the same vin for overall
    const pastValidSaleOverall = await this.repo.findOne({
      vin,
      isValidOverall: true,
    });
    if (pastValidSaleOverall) {
      // if a past sale is present, then mark this one as invalid
      isValidOverall = false;
    }

    if (String(validation) !== '1') {
      isValid = false;
      isValidOverall = false;
    }
    newSale.vin = vin;
    newSale.couponNumber = couponNumber;
    newSale.validation = String(validation) === '1';
    newSale.registerDate = registerDate
      ? this.utilitiesService.parseDMYDateString(registerDate, true)
      : null;
    newSale.zoneName = zoneName;
    newSale.region = region;
    newSale.province = province;
    newSale.dealerDealershipName = dealerDealershipName;
    newSale.reportsDate = reportsDate
      ? this.utilitiesService.parseMDYDateString(reportsDate, true)
      : null;
    newSale.days = days && !isNaN(Number(days)) ? Number(days) : null;
    newSale.zvks = zvks;
    newSale.my = my;
    newSale.kmat = kmat;
    newSale.modelName = modelName;

    const model = await this.modelsService.findByNameOrAlias(modelName);
    newSale.model = model;
    // mark as invalid for segments ignored
    if (model.segment.ignore) {
      isValid = false;
      isValidOverall = false;
    }

    newSale.aeade = aeade;
    // This segment does not affect the "segment is ignored" validation
    newSale.segment = segment;
    newSale.family = family;
    newSale.vehicleType = vehicleType;
    newSale.color = color;
    newSale.keySaleType = keySaleType;
    newSale.validFleet = validFleet;

    newSale.cancellationDate = cancellationDate
      ? this.utilitiesService.parseDMYDateString(cancellationDate, true)
      : null;

    newSale.retailInvoiceDate = this.utilitiesService.parseMDYDateString(
      retailInvoiceDate,
    );
    newSale.financeType = financeType;
    newSale.paymentMethod = paymentMethod;
    newSale.leasingFinancial = leasingFinancial;
    newSale.salesmanDocument = this.utilitiesService.cleanDocument(
      `${salesmanDocument}`,
      this.instanceSlug,
    );
    newSale.salesman = salesman;
    newSale.couponStatus = couponStatus;
    newSale.retailInvoiceNumber = retailInvoiceNumber;
    newSale.chevystar = chevystar === 'Y';
    newSale.keyFleet = keyFleet;
    newSale.netValue =
      netValue && !isNaN(this.utilitiesService.parseNumberString(netValue))
        ? this.utilitiesService.parseNumberString(netValue)
        : null;
    newSale.totalValue =
      netValue && !isNaN(this.utilitiesService.parseNumberString(totalValue))
        ? this.utilitiesService.parseNumberString(totalValue)
        : null;
    newSale.salesType = salesType;
    newSale.vehicleUse = vehicleUse;
    newSale.zone2 = zone2;
    newSale.deliveryDate = deliveryDate
      ? this.utilitiesService.parseDMYDateString(deliveryDate, true)
      : null;
    newSale.createdBy = createdBy;
    newSale.createdDate = createdDate
      ? this.utilitiesService.parseDMYDateString(createdDate, true)
      : null;
    newSale.previousVehicleBrand = previousVehicleBrand;
    newSale.previousVehicleModel = previousVehicleModel;
    newSale.previousVehicleYear = previousVehicleYear
      ? Number(previousVehicleYear)
      : null;
    newSale.cancellationCause = cancellationCause;
    newSale.insuranceCompany = insuranceCompany;
    newSale.businessName = businessName;
    newSale.document = `${document}`;
    this.leadsService.validateDocument(newSale);
    newSale.contact = contact;
    newSale.gender = gender;
    newSale.birthDate = birthDate
      ? this.utilitiesService.parseDMYDateString(birthDate, true)
      : null;

    if (phone) {
      const validationPhone = await this.utilitiesService.validatePhone(
        String(phone),
        this.instanceSlug,
      );
      newSale.phone = validationPhone.phone;
      newSale.phoneIsValid = validationPhone.isValid;
    }

    if (homePhone) {
      const validationHomePhone = await this.utilitiesService.validatePhone(
        String(homePhone),
        this.instanceSlug,
      );
      newSale.homePhone = validationHomePhone.phone;
      newSale.phoneIsValid = !newSale.phoneIsValid
        ? validationHomePhone.isValid
        : newSale.phoneIsValid;
    }

    if (mobile) {
      const validationMobile = await this.utilitiesService.validatePhone(
        String(mobile),
        this.instanceSlug,
      );
      newSale.mobile = validationMobile.phone;
      newSale.phoneIsValid = !newSale.phoneIsValid
        ? validationMobile.isValid
        : newSale.phoneIsValid;
    }

    // TODO: normalize names

    newSale.address = address;
    newSale.email = email;
    newSale.cityName = cityName;
    newSale.city = cityName
      ? await this.citiesService.findByNameOrAlias(cityName)
      : null;
    newSale.country = country;
    newSale.vehicleYear = vehicleYear ? Number(vehicleYear) : null;
    newSale.dealershipCode = dealershipCode;
    newSale.dealershipId = dealershipId;
    newSale.duplicated = duplicated ? Number(duplicated) : null;
    //sales-lead for club presidente
    newSale.isValid = isValid;

    let daysInPast = this.instanceSlug === 'cl' ? 360 : 120;
    const januaryFirst2021 = new Date(2021, 0, 1);
    const mayFirst2021 = new Date(2021, 4, 1);
    if (isValid) {
      // Find a lead to link this sale to

      const currentDate = new Date();
      const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
      const februarySeven = new Date(currentDate.getFullYear(), 1, 7);

      // Find a lead between 1 and 120 days in the past
      let minimumDate = subDays(newSale.retailInvoiceDate, daysInPast);
      let maximumDate = endOfDay(subDays(newSale.retailInvoiceDate, 1));

      if (this.instanceSlug !== 'cl') {
        if (this.instanceSlug !== 'pe') {
          // If the retailInvoiceDate is more than Febr 7
          // AND the 120 in past are less than Jan 1st.
          // I set the minimum to Jan 1st
          if (maximumDate > februarySeven) {
            if (minimumDate < januaryFirst) {
              minimumDate = januaryFirst;
            }
          }
        }
      }

      // if (this.instanceSlug === 'cl') {
      //   if (newSale.retailInvoiceDate < mayFirst2021) {
      //     daysInPast = 120;
      //   } else {
      //     minimumDate = januaryFirst2021;
      //     daysInPast = 360;
      //   }
      // }

      const possibleLeads = await this.leadsService.find({
        where: {
          // Find a lead between 1 and 120 days in the past
          creationDate: Between(minimumDate, maximumDate),
          // With a matching document
          document: newSale.document,
          // That is valid
          isValid: true,
        },
        relations: [
          'dealerDealership',
          'dealerDealership.dealerCity',
          'dealerDealership.dealerCity.dealerGroup',
          'sales',
        ],
        // Preffer the oldest one
        order: { creationDate: 'ASC' },
      });
      for (const lead of possibleLeads) {
        // Now find the first lead that matched the criteria
        // with matching dealerGropups and without previous
        // sales matched
        if (
          lead.sales.length === 0 &&
          lead.dealerDealership.dealerCity.dealerGroup.id ===
            newSale.dealerDealership.dealerCity.dealerGroup.id
        ) {
          newSale.lead = lead;
          // Break at the first occurrence
          break;
        }
      }
      //set the sale as invalid when it doesnt match a lead
      if (!newSale.lead) {
        newSale.isValid = false;
      }
    }
    //sales-lead for overall
    newSale.isValidOverall = isValidOverall;
    if (isValidOverall) {
      let minimumDate = subDays(newSale.retailInvoiceDate, daysInPast);
      let maximumDate = endOfDay(newSale.retailInvoiceDate);

      // if (this.instanceSlug === 'cl') {
      //   if (newSale.retailInvoiceDate < mayFirst2021) {
      //     daysInPast = 120;
      //   } else {
      //     minimumDate = januaryFirst2021;
      //     daysInPast = 360;
      //   }
      // }

      // Repeat for overall Lead
      const possibleOverallLeads = await this.leadsService.find({
        where: {
          creationDate: Between(minimumDate, maximumDate),
          // With a matching document
          document: newSale.document,
        },
        relations: ['overallSales'],
        // Preffer the oldest one
        order: { creationDate: 'ASC' },
      });
      for (const lead of possibleOverallLeads) {
        // Now find the first lead that matched the criteria
        // that is valid or duplicated and do not have previous
        // overallSales matched
        const leadIsValidOrDuplicated = lead.isValid || lead.duplicated;
        if (lead.overallSales.length === 0 && leadIsValidOrDuplicated) {
          newSale.overallLead = lead;
          // Break at the first occurrence
          break;
        }
      }
      //set the sale as invalid when it doesnt match a lead
      if (!newSale.overallLead) {
        newSale.isValidOverall = false;
      }
    }
    newSale.year = year;
    newSale.month = month;
    await this.repo.save(newSale);
  }

  async createErrorsFile(fileDestination: string, errors: ValidationError[]) {
    const workbook = new Excel.stream.xlsx.WorkbookWriter({
      filename: fileDestination,
    });
    const worksheet = workbook.addWorksheet('Errores');
    worksheet.addRow([
      'Fila',
      'Errores',
      'Nº de Identificación del Vehículo',
      'Número del Cupón',
      'Validación',
      'Fecha de Registro',
      'Zona',
      'Región',
      'Provincia',
      'Concesionario',
      'Cuenta',
      'Cuenta BAC',
      'Fecha para Reportes',
      'DIAS',
      'ZVSK',
      'MY',
      'KMAT',
      'DESCRIPCION',
      'AEADE',
      'SEGMENTO',
      'FAMILIA',
      'TIPO DE VEHICULO',
      'COLOR',
      'CLAVE',
      'VALID FLOTA',
      'Fecha de Cancelación',
      'Fecha de la Factura Retail',
      'Tipo Financiamiento',
      'Forma de Pago',
      'Cia Leasing / Financiera',
      'CI Vendedor',
      'Vendedor',
      'Estatus del Cupón',
      'Número de la Factura Retail',
      'Chevystar Activado',
      'Clave de la Flota',
      'Valor Neto',
      'Valor Total',
      'Tipo de Venta',
      'Uso',
      'Zona2',
      'Fecha de Entrega',
      'Creado por',
      'Creación: fecha',
      'Marca Vehículo anterior',
      'Modelo Vehículo anterior',
      'Año del Vehículo anterior',
      'Causa de la Anulación',
      'Compañía de Seguros',
      'Razón Social de la Cuenta',
      'Cédula de Identificación',
      'Contacto',
      'Género',
      'Fecha de Nacimiento',
      'Teléfono',
      'Teléfono Residencia',
      'Teléfono Movil',
      'Dirección',
      'E-mail',
      'Ciudad',
      'País',
      'Año',
      'Código del Punto de Venta',
      'Cuenta: ID exclusivo externo',
      'Duplicado',
    ]);
    for (const err of errors) {
      worksheet.addRow([err.rowNumber, err.errors.join(' '), ...err.row]);
    }
    worksheet.commit();
    await workbook.commit();
  }

  async salesToDatabase(
    filePath: string,
    fileName: string,
    year: number,
    month: number,
  ) {
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
      await this.createErrorsFile(errorsFileDestination, errors);
      return errorsFileDestination;
    }
    // When there is no error, upload the information to the database
    // but first, delete all the past records for that month / year
    await this.repo.delete({ year, month });
    stream = await getXlsxStream({ filePath, sheet: 0 });
    rowNumber = 0;
    for await (const line of stream) {
      rowNumber += 1;
      // Skip the first row since it contains the headers for each column
      if (rowNumber === 1) {
        continue;
      }
      await this.createFromRow(line.formatted.arr, year, month);
    }
    // Once all sales are created on database, now I reprocess all sales to match with leads
    await this.reprocessSalesWithLeads(year, month);
    return null;
  }

  async reprocessSalesWithLeads(year: number, month: number) {
    this.logger.log(`Reprocessing sales for ${year}-${month}`);
    // First I make NULL the FK in the sales table
    await this.initializeSales(year, month);

    // Now I get all the sales related to the year and month
    const sales = await this.repo.find({
      where: {
        year,
        month,
      },
      relations: [
        'dealerDealership',
        'dealerDealership.dealerCity',
        'dealerDealership.dealerCity.dealerGroup',
      ],
    });
    this.logger.log(`Found ${sales.length} sales`);

    // const daysInPast: 120 | 360 = this.instanceSlug === 'cl' ? 360 : 120;
    // this.logger.log(`Looking for leads for ${daysInPast} days in past`);
    for (const [index, sale] of sales.entries()) {
      this.logger.log('');
      this.logger.log(`#${index + 1} Processing sale ${sale.id}: ${sale.vin}`);
      if (this.instanceSlug === 'cl') {
        await this.findFranchiseLeads(sale, 360);
      } else {
        await this.findFranchiseLeads(sale, 120);
      }
      if (this.instanceSlug === 'cl') {
        await this.findOverallLeads(sale, 360);
      } else {
        await this.findOverallLeads(sale, 120);
      }
    }

    // Finally, I update official leadId and overallLeadId column in the sales table
    this.logger.log(`Updating official columns in sales table`);
    await this.assignSales(year, month);
  }

  /**
   * Initialize the sales for the given year and month, making the ForeignKeys related to
   * the leads and overallSales NULL
   * @param year The year to initialize the sales for
   * @param month The month to initialize the sales for
   */
  async initializeSales(year: number, month: number) {
    this.logger.log(`Initializing sales for ${year}-${month}`);
    await this.repo
      .createQueryBuilder()
      .update()
      .set({
        overallLead120: null,
        franchiseLead120: null,
        overallLead360: null,
        franchiseLead360: null,
        lead: null,
        overallLead: null,
      })
      .where({ year, month })
      .execute();
  }

  async findFranchiseLeads(sale: Sale, daysInPast: 120 | 360) {
    console.log('franchise: sale', sale.isValid);
    if (sale.isValid) {
      this.logger.log(`Searching franchise leads`);
      const currentDate = new Date();
      const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
      const februarySeven = new Date(currentDate.getFullYear(), 1, 7);

      // Find a lead between 1 and 120 days in the past
      let minimumDate = subDays(sale.retailInvoiceDate, daysInPast);
      let maximumDate = endOfDay(subDays(sale.retailInvoiceDate, 1));

      if (this.instanceSlug !== 'cl') {
        if (this.instanceSlug !== 'pe') {
          // If the retailInvoiceDate is more than Febr 7
          // AND the 120 in past are less than Jan 1st.
          // I set the minimum to Jan 1st
          if (maximumDate > februarySeven) {
            if (minimumDate < januaryFirst) {
              minimumDate = januaryFirst;
            }
          }
        }
      }

      console.log('minimumDate', minimumDate);
      console.log('maximumDate', maximumDate);

      const possibleLeads = await this.leadsService.find({
        where: {
          // Find a lead between 1 and 120 days in the past
          creationDate: Between(minimumDate, maximumDate),
          // With a matching document
          document: sale.document,
          // That is valid
          isValid: true,
        },
        relations: [
          'dealerDealership',
          'dealerDealership.dealerCity',
          'dealerDealership.dealerCity.dealerGroup',
          'franchiseSales120',
          'franchiseSales360',
        ],
        // Preffer the oldest one
        order: { creationDate: 'ASC' },
      });
      for (const lead of possibleLeads) {
        // Now find the first lead that matched the criteria
        // with matching dealerGropups and without previous
        // sales matched
        console.log(lead);
        if (
          lead.franchiseSales120.length === 0 &&
          lead.franchiseSales360.length === 0 &&
          lead.dealerDealership.dealerCity.dealerGroup.id ===
            sale.dealerDealership.dealerCity.dealerGroup.id
        ) {
          console.log('Franchise lead found');
          if (daysInPast === 120) {
            this.logger.log(
              `Found 120 franchise lead: ${lead.id} - ${lead.document}`,
            );
            sale.franchiseLead120 = lead;
          }
          if (daysInPast === 360) {
            this.logger.log(
              `Found 360 franchise lead: ${lead.id} - ${lead.document}`,
            );
            sale.franchiseLead360 = lead;
          }

          // Break at the first occurrence
          break;
        }
      }
      //set the sale as invalid when it doesnt match a lead
      if (!sale.franchiseLead120 && !sale.franchiseLead360) {
        sale.isValid = false;
      }
    } else {
      this.logger.log(`Sale is invalid franchise`);
    }
    await this.repo.save(sale);
  }

  async findOverallLeads(sale: Sale, daysInPast: 120 | 360) {
    console.log('overall: sale', sale.isValidOverall);
    if (sale.isValidOverall) {
      this.logger.log(`Searching overall leads`);
      let minimumDate = subDays(sale.retailInvoiceDate, daysInPast);
      let maximumDate = endOfDay(sale.retailInvoiceDate);

      console.log('minimumDate', minimumDate);
      console.log('maximumDate', maximumDate);

      // Repeat for overall Lead
      const possibleOverallLeads = await this.leadsService.find({
        where: {
          creationDate: Between(minimumDate, maximumDate),
          // With a matching document
          document: sale.document,
        },
        relations: ['overallSales120', 'overallSales360'],
        // Preffer the oldest one
        order: { creationDate: 'ASC' },
      });
      for (const lead of possibleOverallLeads) {
        console.log('lead', lead);
        // Now find the first lead that matched the criteria
        // that is valid or duplicated and do not have previous
        // overallSales matched
        const leadIsValidOrDuplicated = lead.isValid || lead.duplicated;
        if (
          lead.overallSales120.length === 0 &&
          lead.overallSales360.length === 0 &&
          leadIsValidOrDuplicated
        ) {
          console.log('Overall lead is valid or duplicated');
          if (daysInPast === 120) {
            this.logger.log(
              `Found 120 overall lead: ${lead.id} - ${lead.document}`,
            );
            sale.overallLead120 = lead;
          }
          if (daysInPast === 360) {
            this.logger.log(
              `Found 360 overall lead: ${lead.id} - ${lead.document}`,
            );
            sale.overallLead360 = lead;
          }
          // Break at the first occurrence
          break;
        }
      }
      //set the sale as invalid when it doesnt match a lead
      if (!sale.overallLead120 && !sale.overallLead360) {
        sale.isValidOverall = false;
      }
    } else {
      this.logger.log(`Sale is invalid overall`);
    }
    await this.repo.save(sale);
  }

  /**
   * This function helps to reprocess all the sales of a given year
   * @param year The year to reprocess
   */
  async reprocessSalesWithLeadsOfWholeYear(year: number) {
    console.info(`Reprocess sales with leads of year ${year}`);
    for (let month = 1; month <= 12; month++) {
      await this.reprocessSalesWithLeads(year, month);
    }
  }

  async assignSales(year: number, month: number) {
    this.logger.log(`Assigning sales for ${year}-${month}`);
    const saleAssignationRules = await this.salesAssignationsService.getActiveRules();
    if (saleAssignationRules.length === 0) return;

    for (const saleAssignationRule of saleAssignationRules) {
      this.logger.log(
        `Taking Sale Assignation with id ${saleAssignationRule.id}`,
      );
      this.logger.log(`From: ${saleAssignationRule.fromLeadsDate}`);
      this.logger.log(`To: ${saleAssignationRule.toLeadsDate}`);
      const rule: {
        franchiseColumn:
          | 'franchiseLead120'
          | 'franchiseLead360'
          | 'franchiseLeadXTime';
        overallColumn: 'overallLead120' | 'overallLead360' | 'overallLeadXTime';
      } = {
        franchiseColumn: 'franchiseLead120',
        overallColumn: 'overallLead120',
      };

      if (saleAssignationRule.take120FranchiseSales) {
        const sales = await this.repo
          .createQueryBuilder('s')
          .innerJoinAndSelect('s.franchiseLead120', 'l120')
          .where('s.month = :month', { month })
          .andWhere('s.year = :year', { year })
          .andWhere(
            'l120.creationDate >= :fromLeadsDate AND l120.creationDate <= :toLeadsDate',
            {
              fromLeadsDate: saleAssignationRule.fromLeadsDate,
              toLeadsDate: saleAssignationRule.toLeadsDate,
            },
          )
          .getMany();
        rule.franchiseColumn = 'franchiseLead120';
        await this.assignSaleBasedOnRule(sales, rule);
      }
      if (saleAssignationRule.take360FranchiseSales) {
        const sales = await this.repo
          .createQueryBuilder('s')
          .innerJoinAndSelect('s.franchiseLead360', 'l360')
          .where('s.month = :month', { month })
          .andWhere('s.year = :year', { year })
          .andWhere(
            'l360.creationDate >= :fromLeadsDate AND l360.creationDate <= :toLeadsDate',
            {
              fromLeadsDate: saleAssignationRule.fromLeadsDate,
              toLeadsDate: saleAssignationRule.toLeadsDate,
            },
          )
          .getMany();
        rule.franchiseColumn = 'franchiseLead360';
        await this.assignSaleBasedOnRule(sales, rule);
      }
      if (saleAssignationRule.take120OverallSales) {
        const sales = await this.repo
          .createQueryBuilder('s')
          .innerJoinAndSelect('s.overallLead120', 'o120')
          .where('s.month = :month', { month })
          .andWhere('s.year = :year', { year })
          .andWhere(
            'o120.creationDate >= :fromLeadsDate AND o120.creationDate <= :toLeadsDate',
            {
              fromLeadsDate: saleAssignationRule.fromLeadsDate,
              toLeadsDate: saleAssignationRule.toLeadsDate,
            },
          )
          .getMany();
        rule.overallColumn = 'overallLead120';
        await this.assignSaleBasedOnRule(sales, rule);
      }
      if (saleAssignationRule.take360OverallSales) {
        const sales = await this.repo
          .createQueryBuilder('s')
          .innerJoinAndSelect('s.overallLead360', 'o360')
          .where('s.month = :month', { month })
          .andWhere('s.year = :year', { year })
          .andWhere(
            'o360.creationDate >= :fromLeadsDate AND o360.creationDate <= :toLeadsDate',
            {
              fromLeadsDate: saleAssignationRule.fromLeadsDate,
              toLeadsDate: saleAssignationRule.toLeadsDate,
            },
          )
          .getMany();
        rule.overallColumn = 'overallLead360';
        await this.assignSaleBasedOnRule(sales, rule);
      }
      if (saleAssignationRule.takeXTimeFranchiseSales) {
        const sales = await this.repo
          .createQueryBuilder('s')
          .innerJoinAndSelect('s.franchiseLeadXTime', 'lXTime')
          .where('s.month = :month', { month })
          .andWhere('s.year = :year', { year })
          .andWhere(
            'lXTime.creationDate >= :fromLeadsDate AND lXTime.creationDate <= :toLeadsDate',
            {
              fromLeadsDate: saleAssignationRule.fromLeadsDate,
              toLeadsDate: saleAssignationRule.toLeadsDate,
            },
          )
          .getMany();
        rule.franchiseColumn = 'franchiseLeadXTime';
        await this.assignSaleBasedOnRule(sales, rule);
      }
      if (saleAssignationRule.takeXTimeOverallSales) {
        const sales = await this.repo
          .createQueryBuilder('s')
          .innerJoinAndSelect('s.overallLeadXTime', 'oXTime')
          .where('s.month = :month', { month })
          .andWhere('s.year = :year', { year })
          .andWhere(
            'oXTime.creationDate >= :fromLeadsDate AND oXTime.creationDate <= :toLeadsDate',
            {
              fromLeadsDate: saleAssignationRule.fromLeadsDate,
              toLeadsDate: saleAssignationRule.toLeadsDate,
            },
          )
          .getMany();
        rule.overallColumn = 'overallLeadXTime';
        await this.assignSaleBasedOnRule(sales, rule);
      }
    }
  }

  async assignSaleBasedOnRule(
    sales: Sale[],
    rule: {
      franchiseColumn:
        | 'franchiseLead120'
        | 'franchiseLead360'
        | 'franchiseLeadXTime';
      overallColumn: 'overallLead120' | 'overallLead360' | 'overallLeadXTime';
    },
  ) {
    for (const [index, sale] of sales.entries()) {
      this.logger.log('');
      this.logger.log(`#${index + 1} Assigning sale ${sale.id}: ${sale.vin}`);
      if (
        !sale.overallLead120 &&
        !sale.overallLead360 &&
        !sale.franchiseLead120 &&
        !sale.franchiseLead360 &&
        !sale.overallLeadXTime &&
        !sale.franchiseLeadXTime
      ) {
        // If the sale has no leads, it is not assigned
        continue;
      }

      sale.lead = sale[rule.franchiseColumn];
      sale.overallLead = sale[rule.overallColumn];
      await this.repo.save(sale);
    }
  }

  /**
   * This function helps to reprocess all the sales of a given year
   * @param year The year to reprocess
   */
  async assignSalesOfWholeYear(year: number) {
    console.info(`Assigning sales with leads of year ${year}`);
    for (let month = 1; month <= 12; month++) {
      await this.reprocessSalesWithLeads(year, month);
    }
  }
  async getSalesResults(
    resultsArray,
    fromYearMonth: string,
    dealerGroup: DealerGroup | null = null,
    lastYear: string | null = null,
  ): Promise<any> {
    let query = getConnection()
      .getRepository(Sale)
      .createQueryBuilder('s')
      .select('COUNT(s.leadId)', 'numSales')
      .innerJoin('s.lead', 'l')
      .innerJoin('s.dealerDealership', 'dd')
      .innerJoin('dd.dealerCity', 'dc')
      .innerJoin('dc.dealerGroup', 'dg')
      .addSelect('dc.id', 'dealer')
      .addSelect('DATE_FORMAT(l.creationDate, "%Y-%m")', 'leadYearMonth')
      .addSelect('DATE_FORMAT(s.retailInvoiceDate, "%Y-%m")', 'saleYearMonth')
      .andWhere('DATE_FORMAT(l.creationDate, "%Y-%m") IS NOT NULL')
      .andWhere('dc.ignore = false')
      .andWhere('DATE_FORMAT(l.creationDate, "%Y-%m") >= :fromYm', {
        fromYm: fromYearMonth,
      });
    //if report is for last year
    if (lastYear) {
      query = query.andWhere("DATE_FORMAT(l.creationDate, '%Y-%m') <= :toYm", {
        toYm: lastYear + '-12',
      });
    }

    // if the parameter dealerCity is send we filter the results just for that dealer
    if (dealerGroup) {
      query = query.andWhere('dg.id = :dealerGroupId', {
        dealerGroupId: dealerGroup.id,
      });
    }

    const salesResults = await query
      .groupBy('dealer')
      .addGroupBy('leadYearMonth')
      .addGroupBy('saleYearMonth')
      .getRawMany();

    // update the resultsArray with sales data
    // [dealerCityId][yearMonthOfLeadCreationDate][sales][yearMonthOfSalesRetailInvoiceDate]
    salesResults.map(sr => {
      if (
        resultsArray[sr.dealer] !== undefined &&
        resultsArray[sr.dealer][sr.leadYearMonth] !== undefined
      ) {
        if (resultsArray[sr.dealer][sr.leadYearMonth].sales) {
          resultsArray[sr.dealer][sr.leadYearMonth].sales[
            sr.saleYearMonth
            // tslint:disable-next-line:radix
          ] = parseInt(sr.numSales);
        } else {
          resultsArray[sr.dealer][sr.leadYearMonth].sales = {
            // tslint:disable-next-line:radix
            [sr.saleYearMonth]: parseInt(sr.numSales),
          };
        }
      } else {
        resultsArray[sr.dealer] = {
          [sr.leadYearMonth]: {
            // tslint:disable-next-line:radix
            sales: { [sr.saleYearMonth]: parseInt(sr.numSales) },
          },
        };
      }
    });
  }

  async getYearSalesForDealer(
    dealerId: number | 'all',
    onlyDdp = false,
  ): Promise<{ count: number; period: string }[]> {
    const today = moment.now();
    const from = moment(today).subtract(12, 'months');
    // Search results only until the Cut Off Day
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
      // When the resulting date has a diffrent month than today, retrun the sales until the end of the month
      to = endOfMonth(to);
    }
    const query = getConnection()
      .getRepository(Sale)
      .createQueryBuilder('s')
      .select('COUNT(s.leadId)', 'count')
      .innerJoin('s.lead', 'l')
      .addSelect('DATE_FORMAT(l.creationDate, "%Y-%m")', 'month')
      .innerJoin('l.campaign', 'lc')
      .innerJoin('s.dealerDealership', 'dd')
      .innerJoin('dd.dealerCity', 'dc')
      .innerJoin('dc.dealerGroup', 'dg')
      .andWhere('DATE_FORMAT(l.creationDate, "%Y-%m") IS NOT NULL')
      .andWhere('dc.ignore = false')
      .andWhere('dg.ignoreOnFunnels = false')
      .andWhere('s.retailInvoiceDate BETWEEN :fromYm AND :toYm', {
        fromYm: from.format('YYYY-MM') + '-01 00:00:00',
        toYm: format(to, 'yyyy-MM-dd kk:mm:ss'),
      })
      .groupBy('DATE_FORMAT(l.creationDate, "%Y-%m")');

    if (dealerId !== 'all') {
      query.andWhere('dg.id = :dealerGroupId', {
        dealerGroupId: dealerId,
      });
    }
    if (onlyDdp) {
      query.andWhere('lc.isDdp = true');
    }
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
}

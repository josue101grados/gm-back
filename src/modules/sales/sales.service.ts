import { Injectable } from '@nestjs/common';
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

type Row = string[];

interface ValidationError {
  row: Row;
  rowNumber: number;
  errors: string[];
}

@Injectable()
export class SalesService extends TypeOrmCrudService<Sale> {
  instanceSlug: string;
  constructor(
    @InjectRepository(Sale) repo,
    private dealersService: DealerDealershipsService,
    private modelsService: ModelsService,
    private citiesService: CitiesService,
    private leadsService: LeadsService,
    private utilitiesService: UtilitiesService,
    private configService: ConfigService,
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

      if (this.instanceSlug === 'cl') {
        if (newSale.retailInvoiceDate < mayFirst2021) {
          daysInPast = 120;
        } else {
          minimumDate = januaryFirst2021;
          daysInPast = 360;
        }
      }

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

      if (this.instanceSlug === 'cl') {
        if (newSale.retailInvoiceDate < mayFirst2021) {
          daysInPast = 120;
        } else {
          minimumDate = januaryFirst2021;
          daysInPast = 360;
        }
      }

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
    return null;
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

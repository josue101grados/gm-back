import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { DealerCitiesService } from 'modules/dealers/dealerCities.service';
import { LeadsService } from 'modules/leads/leads.service';
import { OldRecord } from './oldRecord.entity';
import { SalesService } from 'modules/sales/sales.service';
import { ZonesService } from 'modules/zones/zones.service';
import { Zone } from 'modules/zones/zone.entity';
import { SiebelObjectivesService } from 'modules/siebelObjectives/siebelObjectives.service';
import * as Excel from 'exceljs';
import { ConfigService } from '@nestjs/config';
import moment = require('moment');
import { DealerGroup } from 'modules/dealers/dealerGroup.entity';
import { DealerGroupsService } from 'modules/dealers/dealerGroups.service';
import { UploadsService } from 'modules/uploads/uploads.service';
import { GeneratedReport } from './generatedReports.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UtilitiesService } from 'modules/utilities/utilities.service';

const months = [
  'Ene',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const monthNumToName = (monthNum: string): string => {
  return months[parseInt(monthNum) - 1] || '';
};

@Injectable()
export class ReportsService extends TypeOrmCrudService<GeneratedReport> {
  constructor(
    @InjectRepository(GeneratedReport)
    private generatedReportsRepository: Repository<GeneratedReport>,
    private dealersCitiesService: DealerCitiesService,
    private leadsService: LeadsService,
    private salesService: SalesService,
    private zonesService: ZonesService,
    private siebelObjectivesService: SiebelObjectivesService,
    private configService: ConfigService,
    private dealerGroupsService: DealerGroupsService,
    private uploadsService: UploadsService,
    private utilitiesService: UtilitiesService,
  ) {
    super(generatedReportsRepository);
  }

  async generateAllColorsReports(type = 'normal'): Promise<void> {
    const instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
    const dealerGroups = await this.dealerGroupsService.find();
    const today = moment.now();
    const lastMonth = moment(today)
      .subtract(1, 'months')
      .format('MMM');
    const presentYear = moment(today).format('YYYY');
    //set filename
    let filename = '';
    switch (type) {
      case 'preliminar':
        filename = 'CIERRE_PRELIMINAR_' + lastMonth + '_';
        break;
      case 'oficial':
        filename = 'CIERRE_OFICIAL_' + lastMonth + '_';
        break;
    }
    filename += moment(today).format('YYYY-MM-DD HH:mm:ss') + '.xlsx';

    //Consolidated Report
    const consolidatedResults = await this.getColorsReportResults();
    //upload consolidated report
    const fileName = filename;
    const filePath = `temp/colors-report-${fileName}`;
    const fileDestination = `uploads/reporte-colores/consolidados/${presentYear}/${fileName}`;
    await this.exportColorsReport(consolidatedResults, filePath);
    //search file from the same date
    const generatedReport = await this.findGeneratedReportByDateAndDealerGroup(
      type,
    );
    if (generatedReport) {
      await this.uploadsService.deleteFileByPublicUrl(generatedReport.path);
      // If this file already exists remove
      await this.generatedReportsRepository.remove(generatedReport);
    }
    //save file
    const uploadRes = await this.uploadsService.uploadToGoogleAndMakePublic(
      filePath,
      fileDestination,
    );
    //save file info
    const newGeneratedReport = this.generatedReportsRepository.create();
    newGeneratedReport.date = new Date();
    newGeneratedReport.report = `colors_${type}`;
    newGeneratedReport.path = uploadRes;
    await this.generatedReportsRepository.save(newGeneratedReport);

    //delete temp file
    await this.uploadsService.deleteFile(filePath);

    //Generate Dealer Groups reports
    for await (const dealerGroup of dealerGroups) {
      if (
        (instanceSlug === 'co' &&
          (dealerGroup.name === 'INTERNACIONAL' ||
            dealerGroup.name === 'TEST COLOMBIA')) ||
        (instanceSlug === 'ec' && dealerGroup.name === 'TEST ECUADOR')
      ) {
        continue;
      }
      const dealerGroupResults = await this.getColorsReportResults(dealerGroup);
      //upload dealerGroup report
      const fileNameDealerGroup = filename;
      const filePathDealerGroup = `temp/${dealerGroup.name}-${fileNameDealerGroup}`;
      const fileDestinationDealerGroup = `uploads/reporte-colores/concesionarios/${dealerGroup.name}/${presentYear}/${fileNameDealerGroup}`;
      console.log(`DEALER: ${dealerGroup.name}`);

      if (JSON.stringify(dealerGroupResults.data) === JSON.stringify({}))
        continue;

      await this.exportColorsReport(dealerGroupResults, filePathDealerGroup);
      //search file from the same date
      const generatedGroupReport = await this.findGeneratedReportByDateAndDealerGroup(
        type,
        dealerGroup,
      );
      if (generatedGroupReport) {
        await this.uploadsService.deleteFileByPublicUrl(
          generatedGroupReport.path,
        );
        // If this file already exists remove
        await this.generatedReportsRepository.remove(generatedGroupReport);
      }
      //save file
      const uploadDealerGroupRes = await this.uploadsService.uploadToGoogleAndMakePublic(
        filePathDealerGroup,
        fileDestinationDealerGroup,
      );
      //save file info
      const newGeneratedReportDealerGroup = this.generatedReportsRepository.create();
      newGeneratedReportDealerGroup.date = new Date();
      newGeneratedReportDealerGroup.report = `colors_${type}`;
      newGeneratedReportDealerGroup.path = uploadDealerGroupRes;
      newGeneratedReportDealerGroup.dealerGroup = dealerGroup;
      await this.generatedReportsRepository.save(newGeneratedReportDealerGroup);

      //delete temp file
      await this.uploadsService.deleteFile(filePathDealerGroup);
    }
  }

  async generateLastYearColorsReports(): Promise<void> {
    const instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
    const dealerGroups = await this.dealerGroupsService.find();
    const today = moment.now();
    const lastMonth = moment(today)
      .subtract(1, 'months')
      .format('MMM');
    const presentYear = moment(today)
      .subtract(1, 'years')
      .format('YYYY');
    //set filename
    let filename = 'CIERRE_OFICIAL_Dic_';
    filename += presentYear + '-12-31 23:59:59.xlsx';

    //Consolidated Report
    const consolidatedResults = await this.getColorsReportResults(null, true);
    //upload consolidated report
    const fileName = filename;
    const filePath = `temp/colors-report-${fileName}`;
    const fileDestination = `uploads/reporte-colores/consolidados/${presentYear}/${fileName}`;
    await this.exportColorsReport(consolidatedResults, filePath, true);
    //search file from the same date
    const generatedReport = await this.findGeneratedReportByDateAndDealerGroup(
      'oficial',
      null,
      true,
    );
    if (generatedReport) {
      await this.uploadsService.deleteFileByPublicUrl(generatedReport.path);
      // If this file already exists remove
      await this.generatedReportsRepository.remove(generatedReport);
    }
    //save file
    const uploadRes = await this.uploadsService.uploadToGoogleAndMakePublic(
      filePath,
      fileDestination,
    );
    //save file info
    const fileDate = new Date(presentYear + '-12-31 23:59:59');
    const newGeneratedReport = this.generatedReportsRepository.create();
    newGeneratedReport.date = fileDate;
    newGeneratedReport.report = `colors_oficial`;
    newGeneratedReport.path = uploadRes;
    await this.generatedReportsRepository.save(newGeneratedReport);

    //delete temp file
    await this.uploadsService.deleteFile(filePath);

    //Generate Dealer Groups reports
    for await (const dealerGroup of dealerGroups) {
      if (
        (instanceSlug === 'co' &&
          (dealerGroup.name === 'INTERNACIONAL' ||
            dealerGroup.name === 'TEST COLOMBIA')) ||
        (instanceSlug === 'ec' && dealerGroup.name === 'TEST ECUADOR')
      ) {
        continue;
      }
      const dealerGroupResults = await this.getColorsReportResults(
        dealerGroup,
        true,
      );
      //upload dealerGroup report
      const fileNameDealerGroup = filename;
      const filePathDealerGroup = `temp/${dealerGroup.name}-${fileNameDealerGroup}`;
      const fileDestinationDealerGroup = `uploads/reporte-colores/concesionarios/${dealerGroup.name}/${presentYear}/${fileNameDealerGroup}`;
      console.log(`DEALER: ${dealerGroup.name}`);
      await this.exportColorsReport(
        dealerGroupResults,
        filePathDealerGroup,
        true,
      );
      //search file from the same date
      const generatedGroupReport = await this.findGeneratedReportByDateAndDealerGroup(
        'oficial',
        dealerGroup,
        true,
      );
      if (generatedGroupReport) {
        await this.uploadsService.deleteFileByPublicUrl(
          generatedGroupReport.path,
        );
        // If this file already exists remove
        await this.generatedReportsRepository.remove(generatedGroupReport);
      }
      //save file
      const uploadDealerGroupRes = await this.uploadsService.uploadToGoogleAndMakePublic(
        filePathDealerGroup,
        fileDestinationDealerGroup,
      );
      //save file info
      const newGeneratedReportDealerGroup = this.generatedReportsRepository.create();
      newGeneratedReportDealerGroup.date = fileDate;
      newGeneratedReportDealerGroup.report = `colors_oficial`;
      newGeneratedReportDealerGroup.path = uploadDealerGroupRes;
      newGeneratedReportDealerGroup.dealerGroup = dealerGroup;
      await this.generatedReportsRepository.save(newGeneratedReportDealerGroup);

      //delete temp file
      await this.uploadsService.deleteFile(filePathDealerGroup);
    }
  }

  async getColorsReportResults(
    dealerGroup: DealerGroup | null = null,
    lastYear: boolean | null = null,
  ): Promise<any> {
    const today = moment.now();
    let year = moment(today).format('YYYY');
    if (lastYear) {
      year = moment(today)
        .subtract(1, 'years')
        .format('YYYY');
    }
    const oldLeadsArray = {};
    // let allLeads = {};
    //if year 2020 fromYearMonth starts at 2020-04
    let fromYearMonth = '2020-04';
    // if is a year > 2020 starts at the firt month
    if (year !== '2020') {
      fromYearMonth = year + '-01';
    }
    //get the leads for delivered leads
    const resultsArray = await this.leadsService.getLeadsResults(
      fromYearMonth,
      dealerGroup,
      year,
    );

    //get the last lead imported that is valid
    const lastLead = await this.leadsService.findOne({
      where: { status: 'SIEBEL', isValid: true },
      order: {
        creationDate: 'DESC',
      },
    });
    //return the numeric month from 0-11, January is 0
    let lastMonth = moment(lastLead.creationDate).month();
    if (lastYear) {
      lastMonth = 11;
    }

    // get the sales that match a lead
    await this.salesService.getSalesResults(
      resultsArray,
      fromYearMonth,
      dealerGroup,
      year,
    );

    //if the present year is 2020, we need to get the old info
    //that is store in old_records table
    let oldResultsArray = {};
    if (year === '2020') {
      oldResultsArray = await this.getOldLeadsResults(dealerGroup);
    }

    //get all the zones and the relation dealerCities
    const queryZones = await getConnection()
      .getRepository(Zone)
      .createQueryBuilder('zone')
      .innerJoinAndSelect('zone.dealerCities', 'dealerCity')
      .where('dealerCity.ignore = false');
    if (dealerGroup !== null) {
      queryZones.innerJoin(
        'dealerCity.dealerGroup',
        'dealerGroup',
        'dealerGroup.id = :idDealerGroup',
        { idDealerGroup: dealerGroup.id },
      );
    }
    const zones = await queryZones.getMany();

    //get all siebelObjectives
    const siebelObjectives = await this.siebelObjectivesService.find({
      where: { year },
      order: { id: 'DESC' },
    });

    //leads and sales detail
    const leadsDetailResults = await this.leadsService.getLeadsDetailResults(
      fromYearMonth,
      dealerGroup,
      'sales',
      year,
    );

    //leads and overall sales detail
    let overallResults = {};
    if (dealerGroup === null) {
      overallResults = await this.leadsService.getLeadsDetailResults(
        fromYearMonth,
        dealerGroup,
        'overall',
        year,
      );
    }

    return {
      data: resultsArray,
      oldLeads: oldResultsArray,
      zones: zones,
      siebelObjectives: siebelObjectives,
      leadsDetailResults: leadsDetailResults,
      overallResults: overallResults,
      lastMonth: lastMonth,
    };
  }

  async getOldLeadsResults(
    dealerGroup: DealerGroup | null = null,
  ): Promise<any> {
    const oldResultsArray = {};
    let query = getConnection()
      .getRepository(OldRecord)
      .createQueryBuilder('oldr')
      .select('oldr')
      .innerJoin('oldr.dealerCity', 'dc')
      .innerJoin('dc.dealerGroup', 'dg');

    //if the parameter dealerCity is send we filter the results just for that dealer
    if (dealerGroup) {
      query = query.andWhere('dg.id = :dealerGroupId', {
        dealerGroupId: dealerGroup.id,
      });
    }

    const oldLeadsResults = await query.getRawMany();

    oldLeadsResults.map(function(olr) {
      if (!oldResultsArray[olr.oldr_dealerCityId]) {
        oldResultsArray[olr.oldr_dealerCityId] = {};
      }
      oldResultsArray[olr.oldr_dealerCityId][olr.oldr_yearMonth] = {
        delivered: parseInt(olr.oldr_delivered),
        won: parseInt(olr.oldr_won),
      };
    });

    return oldResultsArray;
  }

  async exportColorsReport(
    results,
    fileDestination: string,
    lastYear: boolean | null = null,
  ) {
    const instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
    const workbook = new Excel.stream.xlsx.WorkbookWriter({
      filename: fileDestination,
      useStyles: true,
    });
    // const workbook = new Excel.Workbook();
    workbook.creator = '101 Grados';
    workbook.created = new Date();

    //generate Sales Detail Report
    let worksheet = workbook.addWorksheet('Reporte Detallado de Ventas');
    await this.generateLeadsSalesDetailReport(
      results['leadsDetailResults'],
      worksheet,
    );
    worksheet.commit();

    //generate the Club President/PAC Report
    let sheetTitle = 'Club de Presidente';
    if (instanceSlug === 'co') {
      sheetTitle = 'PAC';
    }
    worksheet = workbook.addWorksheet(sheetTitle);
    await this.generateClubPacReport(results, worksheet, sheetTitle, lastYear);
    worksheet.commit();

    //generate Overall Report if is consolidated
    if (results['overallResults'].length > 0) {
      worksheet = workbook.addWorksheet('Overall');
      await this.generateOverallReport(results['overallResults'], worksheet);
    }

    await workbook.commit();
    // await workbook.xlsx.writeFile(fileDestination);
    console.log('TERMINO REPORTE');
  }

  async generateLeadsSalesDetailReport(
    results: any,
    worksheet: Excel.Worksheet,
  ) {
    worksheet.columns = [
      {
        header: 'Mes Lead',
        key: 'leadMonth',
        width: 10,
      },
      {
        header: 'Fecha de Creación',
        key: 'creationDate',
        width: 20,
      },
      {
        header: 'BAC',
        key: 'bac',
        width: 10,
      },
      {
        header: 'Concesionario',
        key: 'dealer',
        width: 50,
      },
      {
        header: 'Zona',
        key: 'zone',
        width: 7,
      },
      {
        header: 'Nombre de la campaña',
        key: 'campaign',
        width: 30,
      },
      {
        header: 'ID de la oportunidad',
        key: 'opportunityName',
        width: 15,
      },
      {
        header: 'Lead válido',
        key: 'valid',
        width: 10,
      },
      {
        header: 'ID del cliente',
        key: 'document',
        width: 15,
      },
      {
        header: 'Nombre del contacto',
        key: 'names',
        width: 30,
      },
      {
        header: 'Apellidos del contacto',
        key: 'lastNames',
        width: 30,
      },
      {
        header: 'Modelo',
        key: 'model',
        width: 25,
      },
      {
        header: 'VIN',
        key: 'vin',
        width: 20,
      },
      {
        header: 'Fecha Factura Retail',
        key: 'retailInvoiceDate',
        width: 20,
      },
      {
        header: 'Modelo',
        key: 'salesModel',
        width: 25,
      },
    ];

    [
      'A1',
      'B1',
      'C1',
      'D1',
      'E1',
      'F1',
      'G1',
      'H1',
      'I1',
      'J1',
      'K1',
      'L1',
      'M1',
      'N1',
      'O1',
    ].map(key => {
      worksheet.getCell(key).style = {
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'BFBFBF' },
          bgColor: { argb: 'BFBFBF' },
        },
        font: {
          bold: true,
        },
      };
    });

    for (const lead of results) {
      const creationDate = moment(lead.creationDate).format(
        'YYYY-MM-DD HH:mm:ss',
      );
      const retailInvoiceDate = lead.s_retailInvoiceDate
        ? moment(lead.s_retailInvoiceDate).format('YYYY-MM-DD HH:mm:ss')
        : '';
      worksheet.addRow({
        leadMonth: lead.filterYearMonth,
        creationDate: creationDate,
        bac: lead.bac,
        dealer: lead.dealer,
        zone: lead.zone,
        campaign: lead.campaign,
        opportunityName: lead.opportunityName,
        valid: lead.invalid ? 'No' : 'Si',
        document: lead.document,
        names: lead.names,
        lastNames: lead.lastNames,
        model: lead.model,
        vin: lead.s_vin,
        retailInvoiceDate: retailInvoiceDate,
        salesModel: lead.sm_model,
      });
    }
  }

  async generateClubPacReport(
    results: object,
    worksheet: Excel.Worksheet,
    sheetTitle: string,
    lastYear: boolean | null = null,
  ) {
    const instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
    const today = moment();
    let presentYear = today.year();
    if (lastYear) {
      presentYear = moment(today)
        .subtract(1, 'years')
        .year();
    }
    const closureColumns = [];
    let lastColumn;
    let newRow;
    const totalRows = [];

    worksheet.getColumn('A').key = 'keyZone';
    worksheet.getColumn('B').key = 'keydealerCity';
    //HEADERS
    let column = 3;
    const row1 = worksheet.getRow(1);
    const row2 = worksheet.getRow(2);
    let auxCol = column;
    let trimester = 0;
    row2.getCell(1).value = 'Gte. Distrito';
    worksheet.getColumn(1).width = 3;
    row2.getCell(1).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BFBFBF' },
        bgColor: { argb: 'BFBFBF' },
      },
    };
    row2.getCell(2).value = 'Concesionario';
    worksheet.getColumn(2).width = 35;
    row2.getCell(2).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BFBFBF' },
        bgColor: { argb: 'BFBFBF' },
      },
    };
    //HEADERS for each month
    for (let i = 0; i <= results['lastMonth']; i++) {
      //if year 2020 has different headers
      if (i < 3 && presentYear === 2020) {
        trimester++;
        auxCol = column;
        row1.getCell(column).value = months[i] + '-' + presentYear;

        worksheet.getColumn(column).key = 'won' + i;
        worksheet.getColumn(column).width = 6;
        row2.getCell(column).value = 'Ganados';
        row2.getCell(column).style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'BFBFBF' },
            bgColor: { argb: 'BFBFBF' },
          },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };

        column++;
        worksheet.getColumn(column).key = 'delivered' + i;
        worksheet.getColumn(column).width = 6;
        row2.getCell(column).value = 'Entregados';
        row2.getCell(column).style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'BFBFBF' },
            bgColor: { argb: 'BFBFBF' },
          },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
        column++;
        closureColumns.push(column);
        worksheet.getColumn(column).key = 'closure' + i;
        worksheet.getColumn(column).width = 6;
        row2.getCell(column).value = 'Cierre';
        worksheet.mergeCells([1, auxCol, 1, column]);
        row2.getCell(column).style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'BFBFBF' },
            bgColor: { argb: 'BFBFBF' },
          },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
        column++;
        //print the Q1 data
        if (trimester === 3) {
          auxCol = column;
          row1.getCell(column).value = 'Q1';
          row1.getCell(column).style = {
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '00000' },
              bgColor: { argb: '000000' },
            },
            font: {
              bold: true,
              color: { argb: 'FFFFFF' },
            },
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            },
          };

          worksheet.getColumn(column).key = 'won' + i;
          worksheet.getColumn(column).width = 6;
          row2.getCell(column).value = 'Ganados';
          row2.getCell(column).style = {
            font: {
              bold: true,
            },
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            },
          };

          column++;
          worksheet.getColumn(column).key = 'delivered' + i;
          worksheet.getColumn(column).width = 6;
          row2.getCell(column).value = 'Entregados';
          row2.getCell(column).style = {
            font: {
              bold: true,
            },
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            },
          };

          column++;
          closureColumns.push(column);
          worksheet.getColumn(column).key = 'closure' + i;
          worksheet.getColumn(column).width = 6;
          row2.getCell(column).value = 'Cierre';
          row2.getCell(column).style = {
            font: {
              bold: true,
            },
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            },
          };
          worksheet.mergeCells([1, auxCol, 1, column]);
          column++;
          //set trimester 0
          trimester = 0;
        }
        //if year is different of 2020
      } else {
        auxCol = column;
        row1.getCell(column).value = months[i] + '-' + presentYear;
        worksheet.getColumn(column).key = 'leads' + i;
        worksheet.getColumn(column).width = 6;
        row2.getCell(column).value = 'Leads Válidos';
        row2.getCell(column).style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'BFBFBF' },
            bgColor: { argb: 'BFBFBF' },
          },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
        };

        //sales can be from the present month to 5 months later
        column++;
        let salesColumns = i + 5;
        for (let j = i; j < salesColumns; j++) {
          //if month is greater than 12 it has to start again in 1
          if (j === 12) {
            j = 0;
            salesColumns = salesColumns - 12;
          }
          //header for each sales month
          worksheet.getColumn(column).key = 'm' + i + 'Sales' + j;
          worksheet.getColumn(column).width = 6;
          row2.getCell(column).value = 'Ventas ' + months[j];
          row2.getCell(column).style = {
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'BFBFBF' },
              bgColor: { argb: 'BFBFBF' },
            },
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            },
          };
          column++;
        }
        //header total sales
        worksheet.getColumn(column).key = 'TotalSales' + i;
        worksheet.getColumn(column).width = 6;
        row2.getCell(column).value = 'Total Ventas';
        row2.getCell(column).style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'BFBFBF' },
            bgColor: { argb: 'BFBFBF' },
          },
        };

        //header closure
        column++;
        closureColumns.push(column);
        worksheet.getColumn(column).key = 'closure' + i;
        worksheet.getColumn(column).width = 6;
        row2.getCell(column).value = 'Tasa de Cierre';
        row2.getCell(column).style = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'BFBFBF' },
            bgColor: { argb: 'BFBFBF' },
          },
        };
        worksheet.mergeCells([1, auxCol, 1, column]);
        //final column
        lastColumn = column;
        column++;
      }
    }
    //Fill with data
    let rowValues = []; //array for a row values
    //get the totals
    const totalResults = {};
    //iterate by zones
    for (const zone of results['zones']) {
      //get the totals for the zone in zoneResults
      const zoneResults = {};
      //iterate by dealerCities
      const trimesterTotal = {};
      for (const dealerCity of zone.__dealerCities__) {
        if (instanceSlug === 'co' && dealerCity.name === 'INTERNACIONAL') {
          continue;
        }
        //set trimester dealerCity key
        trimesterTotal[dealerCity.id] = {};
        //row to add values
        rowValues = [];
        rowValues[1] = zone.name;
        rowValues[2] = dealerCity.name;
        column = 3;
        //iterate for months till the present month
        for (let i = 0; i <= results['lastMonth']; i++) {
          //month takes the format of the key ex. 2020-01
          let month = presentYear + '-';
          if (i < 9) {
            month += '0';
          }
          month += i + 1;
          //if the zoneResult month is not defined, define
          if (zoneResults[month] === undefined) zoneResults[month] = {};
          //print results if present year is 2020
          if (i < 3 && presentYear === 2020) {
            trimester++;
            if (
              !results['oldLeads'][dealerCity.id] ||
              !results['oldLeads'][dealerCity.id][month]
            ) {
              //assign Old leads results
              auxCol = column;

              rowValues[column] = 0;
              //sum the zones results
              zoneResults[month]['won'] =
                zoneResults[month]['won'] === undefined
                  ? rowValues[column]
                  : zoneResults[month]['won'] + rowValues[column];
              //sum trimester results
              trimesterTotal[dealerCity.id]['won'] =
                trimesterTotal[dealerCity.id]['won'] === undefined
                  ? rowValues[column]
                  : trimesterTotal[dealerCity.id]['won'] + rowValues[column];

              column++;
              rowValues[column] = 0;
              //sum the zones results
              zoneResults[month]['delivered'] =
                zoneResults[month]['delivered'] === undefined
                  ? rowValues[column]
                  : zoneResults[month]['delivered'] + rowValues[column];
              //sum trimester results
              trimesterTotal[dealerCity.id]['delivered'] =
                trimesterTotal[dealerCity.id]['delivered'] === undefined
                  ? rowValues[column]
                  : trimesterTotal[dealerCity.id]['delivered'] +
                    rowValues[column];

              //compute the month closure
              const monthClosure = '0%';
              column++;
              rowValues[column] = monthClosure;
              column++;
            } else {
              //assign Old leads results
              const oldLeads = results['oldLeads'][dealerCity.id][month];
              auxCol = column;

              rowValues[column] =
                oldLeads['won'] !== undefined ? oldLeads['won'] : 0;
              //sum the zones results
              zoneResults[month]['won'] =
                zoneResults[month]['won'] === undefined
                  ? rowValues[column]
                  : zoneResults[month]['won'] + rowValues[column];
              //sum trimester results
              trimesterTotal[dealerCity.id]['won'] =
                trimesterTotal[dealerCity.id]['won'] === undefined
                  ? rowValues[column]
                  : trimesterTotal[dealerCity.id]['won'] + rowValues[column];

              column++;
              rowValues[column] =
                oldLeads['delivered'] !== undefined ? oldLeads['delivered'] : 0;
              //sum the zones results
              zoneResults[month]['delivered'] =
                zoneResults[month]['delivered'] === undefined
                  ? rowValues[column]
                  : zoneResults[month]['delivered'] + rowValues[column];
              //sum trimester results
              trimesterTotal[dealerCity.id]['delivered'] =
                trimesterTotal[dealerCity.id]['delivered'] === undefined
                  ? rowValues[column]
                  : trimesterTotal[dealerCity.id]['delivered'] +
                    rowValues[column];

              //compute the month closure
              const monthClosure =
                rowValues[column] === 0
                  ? 0 + '%'
                  : ((rowValues[auxCol] / rowValues[column]) * 100).toFixed(2) +
                    '%';
              column++;
              rowValues[column] = monthClosure;
              column++;
            }
            //print Q1 results
            if (trimester === 3) {
              if (zoneResults['Q1'] === undefined) zoneResults['Q1'] = {};
              auxCol = column;

              rowValues[column] =
                trimesterTotal[dealerCity.id]['won'] !== undefined
                  ? trimesterTotal[dealerCity.id]['won']
                  : 0;
              //sum the zones results
              zoneResults['Q1']['won'] =
                zoneResults['Q1']['won'] === undefined
                  ? rowValues[column]
                  : zoneResults['Q1']['won'] + rowValues[column];

              column++;
              rowValues[column] =
                trimesterTotal[dealerCity.id]['delivered'] !== undefined
                  ? trimesterTotal[dealerCity.id]['delivered']
                  : 0;
              //sum the zones results
              zoneResults['Q1']['delivered'] =
                zoneResults['Q1']['delivered'] === undefined
                  ? rowValues[column]
                  : zoneResults['Q1']['delivered'] + rowValues[column];

              //compute the month closure
              const monthClosure =
                rowValues[column] === 0
                  ? 0 + '%'
                  : ((rowValues[auxCol] / rowValues[column]) * 100).toFixed(2) +
                    '%';
              column++;
              rowValues[column] = monthClosure;
              column++;
              //set trimester to 0
              trimester = 0;
            }
            //if year is different than 2020
          } else {
            if (
              !results['data'][dealerCity.id] ||
              !results['data'][dealerCity.id][month]
            ) {
              rowValues[column] = 0;
              zoneResults[month]['leads'] =
                zoneResults[month]['leads'] === undefined
                  ? rowValues[column]
                  : zoneResults[month]['leads'] + rowValues[column];
              const leads = rowValues[column];

              //sales results
              column++;
              let totalSales = 0;
              let salesColumns = i + 5;
              if (zoneResults[month]['sales'] === undefined) {
                zoneResults[month]['sales'] = {};
              }
              let isANewYear = false;
              for (let j = i; j < salesColumns; j++) {
                //if month is greater than 12 it has to start again in 1
                if (j === 12) {
                  j = 0;
                  salesColumns = salesColumns - 12;
                  isANewYear = true;
                }
                let concatYear = !isANewYear ? presentYear : presentYear + 1;
                //salesMonth takes the format of the key ex. 2020-01
                let salesMonth = concatYear + '-';
                if (j < 9) {
                  salesMonth += '0';
                }
                salesMonth += j + 1;
                rowValues[column] = 0;
                //sum the zones results
                zoneResults[month]['sales'][salesMonth] =
                  zoneResults[month]['sales'][salesMonth] === undefined
                    ? rowValues[column]
                    : zoneResults[month]['sales'][salesMonth] +
                      rowValues[column];
                totalSales += rowValues[column];
                column++;
              }

              rowValues[column] = totalSales;
              //sum the zones results
              zoneResults[month]['totalSales'] =
                zoneResults[month]['totalSales'] === undefined
                  ? rowValues[column]
                  : zoneResults[month]['totalSales'] + rowValues[column];
              column++;
              //compute the month closure
              const salesMonthClosure = '0%';
              rowValues[column] = salesMonthClosure;
              column++;
            } else {
              const dealerMonthData = results['data'][dealerCity.id][month];

              rowValues[column] =
                dealerMonthData['leads'] !== undefined
                  ? dealerMonthData['leads']
                  : 0;
              //sum the zones results
              zoneResults[month]['leads'] =
                zoneResults[month]['leads'] === undefined
                  ? rowValues[column]
                  : zoneResults[month]['leads'] + rowValues[column];
              const leads = rowValues[column];

              //sales results
              column++;
              let totalSales = 0;
              let salesColumns = i + 5;
              if (zoneResults[month]['sales'] === undefined) {
                zoneResults[month]['sales'] = {};
              }
              let isANewYear = false;
              for (let j = i; j < salesColumns; j++) {
                //if month is greater than 12 it has to start again in 1
                if (j === 12) {
                  j = 0;
                  salesColumns = salesColumns - 12;
                  isANewYear = true;
                }
                let concatYear = !isANewYear ? presentYear : presentYear + 1;
                //salesMonth takes the format of the key ex. 2020-01
                let salesMonth = concatYear + '-';
                if (j < 9) {
                  salesMonth += '0';
                }
                salesMonth += j + 1;
                rowValues[column] =
                  dealerMonthData['sales'] !== undefined &&
                  dealerMonthData['sales'][salesMonth] !== undefined
                    ? dealerMonthData['sales'][salesMonth]
                    : 0;
                //sum the zones results
                zoneResults[month]['sales'][salesMonth] =
                  zoneResults[month]['sales'][salesMonth] === undefined
                    ? rowValues[column]
                    : zoneResults[month]['sales'][salesMonth] +
                      rowValues[column];
                totalSales += rowValues[column];
                column++;
              }

              rowValues[column] = totalSales;
              //sum the zones results
              zoneResults[month]['totalSales'] =
                zoneResults[month]['totalSales'] === undefined
                  ? rowValues[column]
                  : zoneResults[month]['totalSales'] + rowValues[column];
              column++;
              //compute the month closure
              const salesMonthClosure =
                totalSales == 0
                  ? 0 + '%'
                  : ((totalSales / leads) * 100).toFixed(2) + '%';
              rowValues[column] = salesMonthClosure;
              column++;
            }
          }
        }
        worksheet.addRow(rowValues);
      }
      //zone Results
      rowValues = [];
      rowValues[1] = zone.name;
      rowValues[2] = 'Resultados ' + zone.name;
      column = 3;
      for (let i = 0; i <= results['lastMonth']; i++) {
        //month takes the format of the key ex. 2020-01
        let month = presentYear + '-';
        if (i < 9) {
          month += '0';
        }
        month += i + 1;
        //define totalResults month key
        if (totalResults[month] === undefined) totalResults[month] = {};
        //print results if present year is 2020
        if (i < 3 && presentYear === 2020) {
          trimester++;
          auxCol = column;
          rowValues[column] =
            zoneResults[month]['won'] !== undefined
              ? zoneResults[month]['won']
              : 0;
          //sum the total results
          totalResults[month]['won'] =
            totalResults[month]['won'] === undefined
              ? rowValues[column]
              : totalResults[month]['won'] + rowValues[column];

          column++;
          rowValues[column] =
            zoneResults[month]['delivered'] !== undefined
              ? zoneResults[month]['delivered']
              : 0;
          //sum the total results
          totalResults[month]['delivered'] =
            totalResults[month]['delivered'] === undefined
              ? rowValues[column]
              : totalResults[month]['delivered'] + rowValues[column];

          //compute the month closure
          const monthClosure =
            rowValues[column] === 0
              ? 0 + '%'
              : ((rowValues[auxCol] / rowValues[column]) * 100).toFixed(2) +
                '%';
          column++;
          rowValues[column] = monthClosure;
          column++;
          //if Q1 print results
          if (trimester === 3) {
            if (totalResults['Q1'] === undefined) totalResults['Q1'] = {};
            auxCol = column;

            rowValues[column] =
              zoneResults['Q1']['won'] !== undefined
                ? zoneResults['Q1']['won']
                : 0;
            //sum the total results
            totalResults['Q1']['won'] =
              totalResults['Q1']['won'] === undefined
                ? rowValues[column]
                : totalResults['Q1']['won'] + rowValues[column];

            column++;
            rowValues[column] =
              zoneResults['Q1']['delivered'] !== undefined
                ? zoneResults['Q1']['delivered']
                : 0;
            //sum the total results
            totalResults['Q1']['delivered'] =
              totalResults['Q1']['delivered'] === undefined
                ? rowValues[column]
                : totalResults['Q1']['delivered'] + rowValues[column];

            //compute the month closure
            const monthClosure =
              rowValues[column] === 0
                ? 0 + '%'
                : ((rowValues[auxCol] / rowValues[column]) * 100).toFixed(2) +
                  '%';
            column++;
            rowValues[column] = monthClosure;
            column++;
            //set trimester to 0
            trimester = 0;
          }
          //if year is different than 2020
        } else {
          rowValues[column] =
            zoneResults[month]['leads'] !== undefined
              ? zoneResults[month]['leads']
              : 0;
          const leads = rowValues[column];
          //sum the total results
          totalResults[month]['leads'] =
            totalResults[month]['leads'] === undefined
              ? rowValues[column]
              : totalResults[month]['leads'] + rowValues[column];

          column++;
          let salesColumns = i + 5;
          //define sales key in total results
          if (totalResults[month]['sales'] === undefined)
            totalResults[month]['sales'] = {};
          let isANewYear = false;
          for (let j = i; j < salesColumns; j++) {
            if (j === 12) {
              j = 0;
              salesColumns = salesColumns - 12;
              isANewYear = true;
            }
            let concatYear = !isANewYear ? presentYear : presentYear + 1;
            //salesMonth takes the format of the key ex. 2020-01
            let salesMonth = concatYear + '-';
            if (j < 9) {
              salesMonth += '0';
            }
            salesMonth += j + 1;
            rowValues[column] =
              zoneResults[month]['sales'][salesMonth] !== undefined
                ? zoneResults[month]['sales'][salesMonth]
                : 0;
            //sum the total results
            totalResults[month]['sales'][salesMonth] =
              totalResults[month]['sales'][salesMonth] === undefined
                ? rowValues[column]
                : totalResults[month]['sales'][salesMonth] + rowValues[column];
            column++;
          }

          rowValues[column] =
            zoneResults[month]['totalSales'] !== undefined
              ? zoneResults[month]['totalSales']
              : 0;
          //sum the total results
          totalResults[month]['totalSales'] =
            totalResults[month]['totalSales'] === undefined
              ? rowValues[column]
              : totalResults[month]['totalSales'] + rowValues[column];
          const totalSales = rowValues[column];
          column++;
          //compute the month closure
          const salesMonthClosure =
            totalSales === 0
              ? 0 + '%'
              : ((totalSales / leads) * 100).toFixed(2) + '%';
          rowValues[column] = salesMonthClosure;
          column++;
        }
      }
      newRow = worksheet.addRow(rowValues);
      totalRows.push(newRow);
    }

    //total Results
    rowValues = [];
    worksheet.addRow(rowValues);
    rowValues[2] = 'Resultados Totales Mensuales';
    column = 3;
    for (let i = 0; i <= results['lastMonth']; i++) {
      //month takes the format of the key ex. 2020-01
      let month = presentYear + '-';
      if (i < 9) {
        month += '0';
      }
      month += i + 1;
      //print results if present year is 2020
      if (i < 3 && presentYear === 2020) {
        trimester++;
        auxCol = column;
        rowValues[column] =
          totalResults[month]['won'] !== undefined
            ? totalResults[month]['won']
            : 0;

        column++;
        rowValues[column] =
          totalResults[month]['delivered'] !== undefined
            ? totalResults[month]['delivered']
            : 0;

        //compute the month closure
        const monthClosure =
          rowValues[column] === 0
            ? 0 + '%'
            : ((rowValues[auxCol] / rowValues[column]) * 100).toFixed(2) + '%';
        column++;
        rowValues[column] = monthClosure;
        column++;

        //if Q1 print results
        if (trimester === 3) {
          auxCol = column;

          rowValues[column] =
            totalResults['Q1']['won'] !== undefined
              ? totalResults['Q1']['won']
              : 0;

          column++;
          rowValues[column] =
            totalResults['Q1']['delivered'] !== undefined
              ? totalResults['Q1']['delivered']
              : 0;

          //compute the month closure
          const monthClosure =
            rowValues[column] === 0
              ? 0 + '%'
              : ((rowValues[auxCol] / rowValues[column]) * 100).toFixed(2) +
                '%';
          column++;
          rowValues[column] = monthClosure;
          column++;
          //set trimester to 0
          trimester = 0;
        }
        //if year is different than 2020
      } else {
        rowValues[column] =
          totalResults[month]['leads'] !== undefined
            ? totalResults[month]['leads']
            : 0;
        const leads = rowValues[column];

        column++;
        let salesColumns = i + 5;
        let isANewYear = false;
        for (let j = i; j < salesColumns; j++) {
          if (j === 12) {
            j = 0;
            salesColumns = salesColumns - 12;
            isANewYear = true;
          }
          let concatYear = !isANewYear ? presentYear : presentYear + 1;
          //salesMonth takes the format of the key ex. 2020-01
          let salesMonth = concatYear + '-';
          if (j < 9) {
            salesMonth += '0';
          }
          salesMonth += j + 1;
          rowValues[column] =
            totalResults[month]['sales'][salesMonth] !== undefined
              ? totalResults[month]['sales'][salesMonth]
              : 0;
          column++;
        }

        rowValues[column] =
          totalResults[month]['totalSales'] !== undefined
            ? totalResults[month]['totalSales']
            : 0;
        const totalSales = rowValues[column];
        column++;

        //compute the month closure
        const salesMonthClosure =
          totalSales === 0
            ? 0 + '%'
            : ((totalSales / leads) * 100).toFixed(2) + '%';
        rowValues[column] = salesMonthClosure;
        column++;
      }
    }
    newRow = worksheet.addRow(rowValues);
    totalRows.push(newRow);

    //print Siebel Objetives
    let smallCol = worksheet.getColumn(column);
    smallCol.width = 2;
    column++;
    smallCol = worksheet.getColumn(column);
    smallCol.width = 2;
    column++;
    smallCol = worksheet.getColumn(column);
    smallCol.width = 2;
    column++;
    smallCol = worksheet.getColumn(column);
    smallCol.width = 2;
    let row = 3;
    row2.getCell(column).value = sheetTitle;
    row2.getCell(column).style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BFBFBF' },
        bgColor: { argb: 'BFBFBF' },
      },
      font: {
        bold: true,
      },
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
      },
    };
    worksheet.getColumn(column).width = 50;
    for (const siebelObjective of results['siebelObjectives']) {
      const rowObj = worksheet.getRow(row);
      auxCol = column - 2;
      rowObj.getCell(auxCol).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: siebelObjective.color },
        bgColor: { argb: siebelObjective.color },
      };
      rowObj.getCell(column).value = siebelObjective.description;
      rowObj.getCell(column).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      row++;
    }

    //styles for closure columns
    closureColumns.forEach(col => {
      let colors = results['siebelObjectives'];
      if (presentYear == 2020 && col <= 14) {
        colors = this.utilitiesService.colorsOldRecords;
      }
      let i = 0;
      worksheet.getColumn(col).eachCell(async cell => {
        i++;
        if (i > 2) {
          const percentage = cell.value;
          if (percentage !== null) {
            const percent = percentage.toString().replace('%', '');
            const color = await this.getColorByPercentage(
              +percent / 100,
              colors,
            );
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: color },
              bgColor: { argb: color },
            };
          }
        }
      });
    });

    //styles for around border and aligment on cells
    for (let i = 1; i <= lastColumn; ++i) {
      worksheet.getColumn(i).eachCell(async cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
      });
    }
    //styles for total rows
    totalRows.forEach(row => {
      row.eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'BFBFBF' },
          bgColor: { argb: 'BFBFBF' },
        };
      });
    });
    //row2 headers rotate the text
    let i = 1;
    row2.eachCell(cell => {
      if (i !== 2 && i <= lastColumn) {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          textRotation: 90,
        };
      }
      i++;
    });
  }

  async getColorByPercentage(percent, colors): Promise<any> {
    let color = 'FFFFFF';

    for (const result of colors) {
      if (percent >= result.fromPercent && percent <= result.toPercent) {
        color = result.color;
        break;
      }
    }

    return color;
  }
  async generateOverallReport(results: any, worksheet: Excel.Worksheet) {
    worksheet.columns = [
      {
        header: 'Month',
        key: 'leadMonth',
        width: 10,
      },
      {
        header: 'Creation Date',
        key: 'creationDate',
        width: 20,
      },
      {
        header: 'Campaign',
        key: 'campaign',
        width: 30,
      },
      {
        header: 'Opportunity Type',
        key: 'opportunityType',
        width: 30,
      },
      {
        header: 'Lead ID',
        key: 'opportunityName',
        width: 15,
      },
      {
        header: 'BAC',
        key: 'bac',
        width: 10,
      },
      {
        header: 'Dealer',
        key: 'dealer',
        width: 50,
      },
      {
        header: 'Customer ID',
        key: 'document',
        width: 15,
      },
      {
        header: 'Names',
        key: 'names',
        width: 30,
      },
      {
        header: 'LastNames',
        key: 'lastNames',
        width: 30,
      },
      {
        header: 'Model',
        key: 'model',
        width: 25,
      },
      {
        header: 'Converted',
        key: 'converted',
        width: 10,
      },
      {
        header: 'Sale ID',
        key: 'saleDocument',
        width: 15,
      },
      {
        header: 'VIN',
        key: 'vin',
        width: 20,
      },
      {
        header: 'Sale Retail Date',
        key: 'retailInvoiceDate',
        width: 20,
      },
      {
        header: 'Month Sale',
        key: 'saleMonth',
        width: 10,
      },
      {
        header: 'Sale Dealer',
        key: 'salesDealer',
        width: 50,
      },
      {
        header: 'Sales Model',
        key: 'salesModel',
        width: 25,
      },
      {
        header: 'Estimated Purchase Date',
        key: 'normalizedEstimatedPurchaseDate',
        width: 25,
      },
    ];

    [
      'A1',
      'B1',
      'C1',
      'D1',
      'E1',
      'F1',
      'G1',
      'H1',
      'I1',
      'J1',
      'K1',
      'L1',
      'M1',
      'N1',
      'O1',
      'P1',
      'Q1',
      'R1',
      'S1',
    ].map(key => {
      worksheet.getCell(key).style = {
        alignment: { vertical: 'middle', horizontal: 'center' },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'BFBFBF' },
          bgColor: { argb: 'BFBFBF' },
        },
        font: {
          bold: true,
        },
      };
    });

    for (const lead of results) {
      const creationDate = moment(lead.creationDate).format(
        'YYYY-MM-DD HH:mm:ss',
      );
      const retailInvoiceDate = lead.s_retailInvoiceDate
        ? moment(lead.s_retailInvoiceDate).format('YYYY-MM-DD HH:mm:ss')
        : '';
      const saleMonth = lead.s_retailInvoiceDate
        ? moment(lead.s_retailInvoiceDate).format('YYYY-MM')
        : '';
      const converted = lead.s_id ? 'Yes' : 'No';

      worksheet.addRow({
        leadMonth: lead.filterYearMonth,
        creationDate: creationDate,
        campaign: lead.campaign,
        opportunityType: 'Venta Vehículos Nuevos',
        opportunityName: lead.opportunityName,
        bac: lead.bac,
        dealer: lead.dealer,
        document: lead.document,
        names: lead.names,
        lastNames: lead.lastNames,
        model: lead.model,
        converted: converted,
        saleDocument: lead.s_document,
        vin: lead.s_vin,
        retailInvoiceDate: retailInvoiceDate,
        saleMonth: saleMonth,
        salesDealer: lead.s_dealerDealershipName,
        salesModel: lead.sm_model,
        normalizedEstimatedPurchaseDate: lead.normalizedEstimatedPurchaseDate,
      });
    }
  }

  async findGeneratedReportByDateAndDealerGroup(
    type = 'normal',
    dealerGroup: DealerGroup | null = null,
    lastYear: boolean | null = null,
  ): Promise<GeneratedReport> {
    const today = moment.now();
    let fromDate = moment(today).format('YYYY-MM-DD') + ' 00:00:00';
    let toDate = moment(today).format('YYYY-MM-DD') + ' 23:59:59';
    if (lastYear) {
      const year = moment(today)
        .subtract(1, 'years')
        .format('YYYY');
      fromDate = year + '12-31  00:00:00';
      toDate = year + '12-31 23:59:59';
    }

    const query = getConnection()
      .getRepository(GeneratedReport)
      .createQueryBuilder('gr')
      .where('gr.date >= :fromDate', {
        fromDate: fromDate,
      })
      .andWhere('gr.date <= :toDate', {
        toDate: toDate,
      })
      .andWhere(`gr.report like 'colors_${type}'`);
    if (dealerGroup) {
      query.andWhere('gr.dealerGroup = :dealerGroup', {
        dealerGroup: dealerGroup.id,
      });
    } else {
      query.andWhere('gr.dealerGroup IS NULL');
    }

    const generatedReport = await query.getOne();
    return generatedReport;
  }
}

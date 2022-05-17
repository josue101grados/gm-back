import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Visit } from './visit.entity';
import * as Excel from 'exceljs';
import moment = require('moment');
import { getConnection } from 'typeorm';
import { UploadsService } from 'modules/uploads/uploads.service';

@Injectable()
export class VisitsService extends TypeOrmCrudService<Visit> {
  constructor(
    @InjectRepository(Visit) repo,
    private uploadsService: UploadsService,
  ) {
    super(repo);
  }

  async saveVisit(userId): Promise<void> {
    const newVisit = this.repo.create();
    newVisit.user = userId;
    await this.repo.save(newVisit);
  }

  async dailyAccessReport(year, month) {
    // get leads by external form
    const results = await this.getDailyAccessData(year, month);
    return await this.generateDailyAccessReport(results, year, month);
  }

  async getDailyAccessData(year, month): Promise<any> {
    const days = moment(`${year}-${month}`, 'YYYY-M').daysInMonth();

    const results = await getConnection()
      .getRepository(Visit)
      .createQueryBuilder('v')
      .select('u.username')
      .addSelect('GROUP_CONCAT(v.createdAt)', 'dates')
      .innerJoin('v.user', 'u')
      .where(`YEAR(v.createdAt) = ${year}`)
      .andWhere(`MONTH(v.createdAt) = ${month}`)
      .groupBy('u.id')
      .getRawMany();
    for (const result of results) {
      if (!result['days']) result['days'] = {};
      for (let i = 1; i <= days; i++) {
        result['days'][i] = 0;
      }
      const rdays = result['dates'].split(',');
      if (rdays && rdays.length > 0) {
        for (const rday of rdays) {
          const visitDate = moment(rday, 'YYYY-MM-DD HH:mm:ss');
          const visitDay = visitDate.format('D');
          result['days'][visitDay] = 1;
        }
      }
      delete result['dates'];
    }
    return results;
  }

  async generateDailyAccessReport(results: any, year, month) {
    const days = moment(`${year}-${month}`, 'YYYY-M').daysInMonth();

    if (results.length > 0) {
      const today = moment();
      moment.locale('es');
      const filename = `accesos-diarios-${today.format(
        'YYYY-MM-DD_HH:mm:ss',
      )}.xlsx`;
      const fileLocation = `temp/${filename}`;
      const workbook = new Excel.Workbook();
      workbook.creator = '101 Grados';
      workbook.created = new Date();
      const worksheet = workbook.addWorksheet(
        `Reporte Accesos ${today.format('MMMM YYYY')}`,
      );

      worksheet.addRow([]);
      worksheet.addRow(['Año:', year]);
      worksheet.addRow(['Mes:', month]);
      ['A2', 'A3'].map(key => {
        worksheet.getCell(key).style = {
          font: {
            bold: true,
          },
        };
      });
      worksheet.addRow([]);
      //headers
      let row: string[] = [];
      row.push('Usuario');
      for (let i = 1; i <= days; i++) {
        row.push(`Día${i}`);
      }
      worksheet.addRow(row);
      //header styles
      const row5 = worksheet.getRow(5);
      worksheet.getColumn(1).width = 20;
      row5.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'EAA12A' },
          bgColor: { argb: 'EAA12A' },
        };
      });
      //data
      for (const result of results) {
        row = [];
        row.push(result.u_username);
        for (const rday in result.days) {
          row.push(result.days[rday]);
        }
        worksheet.addRow(row);
      }

      await workbook.xlsx.writeFile(fileLocation);

      // Upload File to google
      const fileDestination = `downloads/daily-access/${filename}`;
      const uploadResponse = await this.uploadsService.uploadAndGetPublicUrl(
        fileLocation,
        fileDestination,
      );

      return uploadResponse.publicURL;
    }
  }
}

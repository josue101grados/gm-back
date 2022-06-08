import { Controller, Get, UseGuards, Req, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { Role } from 'modules/roles/role.entity';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { UsersService } from 'modules/users/users.service';
import { UploadsService } from 'modules/uploads/uploads.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private usersService: UsersService,
    private uploadService: UploadsService,
  ) {}

  @Roles('admin', 'dealer')
  @Get('generate-all-colors-reports/:type')
  generateAllColorsReports(@Param('type') type) {
    return this.reportsService.generateAllColorsReports(type);
  }

  // @Roles('admin', 'dealer')
  @Get('generate-last-year-colors-reports/')
  generateLastYearColorsReports() {
    return this.reportsService.generateLastYearColorsReports();
  }

  @Roles('admin', 'dealer', 'gm', 'callcenter')
  @Get('list')
  async listFiles(@Req() req) {
    const userId = req.user.userId;
    const user = await this.usersService.findOne({
      where: { id: userId },
      relations: ['dealerGroup'],
    });
    const canSeeAllReports = role =>
      role.name === 'admin' || role.name === 'gm';
    if ((user.roles as Role[]).find(canSeeAllReports)) {
      return (
        await this.reportsService.find({
          order: {
            date: 'DESC',
          },
        })
      ).map(report => ({
        ...report,
        name: this.uploadService.getFileNameFromUrl(
          report.path,
          '/uploads/reporte-colores',
        ),
      }));
    } else {
      return (
        await this.reportsService.find({
          where: { dealerGroup: user.dealerGroup },
          order: {
            date: 'DESC',
          },
        })
      ).map(report => ({
        ...report,
        name: this.uploadService.getFileNameFromUrl(
          report.path,
          '/uploads/reporte-colores',
        ),
      }));
    }
  }
}

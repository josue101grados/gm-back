import { Controller, UseGuards, Get, Req, Post, Query } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Visit } from './visit.entity';
import { VisitsService } from './visits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';

@Crud({
  model: {
    type: Visit,
  },
})
@Controller('visits')
@UseGuards(JwtAuthGuard)
export class VisitsController implements CrudController<Visit> {
  constructor(public service: VisitsService) {}

  @Roles('admin', 'dealer', 'gm', 'callcenter')
  @Post('save')
  async saveVisit(@Req() req) {
    const userId = req.user.userId;

    this.service.saveVisit(userId);
  }

  @Get('daily-access-report')
  @Roles('admin', 'gm')
  async dailyAccessReport(@Query('year') year, @Query('month') month) {
    // Send the report url
    return await this.service.dailyAccessReport(year, month);
  }
}
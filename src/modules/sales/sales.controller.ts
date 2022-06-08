import { Controller, UseGuards, Put, Body, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';

import { ReprocessSalesByMonth, ReprocessSalesByYear } from './sale.dto';
import { TasksService } from '../tasks/tasks.service';
import { TaskTypes } from '../tasks/task.entity';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private tasksService: TasksService) {}

  @Put('/reprocess-by-month')
  @Roles('admin')
  async reprocessByMonth(
    @Req() req,
    @Query() { year, month }: ReprocessSalesByMonth,
  ) {
    await this.tasksService.createTask({
      type: TaskTypes.REPROCESS_SALES_MONTH,
      data: { year, month },
      user: req.user,
      filePath: '',
    });
    return 'Reprocessing sales by month, check your task list for status';
  }
  @Put('/reprocess-by-year')
  @Roles('admin')
  async reprocessByYear(@Req() req, @Query() { year }: ReprocessSalesByYear) {
    await this.tasksService.createTask({
      type: TaskTypes.REPROCESS_SALES_YEAR,
      data: { year },
      user: req.user,
      filePath: '',
    });
    return 'Reprocessing sales by year, check your task list for status';
  }

  @Put('/assign-by-year')
  @Roles('admin')
  async assignByYear(@Req() req, @Query() { year }: ReprocessSalesByYear) {
    await this.tasksService.createTask({
      type: TaskTypes.ASSSIGN_SALES_YEAR,
      data: { year },
      user: req.user,
      filePath: '',
    });
    return 'Reassigning sales by year, check your task list for status';
  }

  @Put('/assign-by-month')
  @Roles('admin')
  async assignByMonth(
    @Req() req,
    @Query() { year, month }: ReprocessSalesByMonth,
  ) {
    await this.tasksService.createTask({
      type: TaskTypes.ASSSIGN_SALES_MONTH,
      data: { year, month },
      user: req.user,
      filePath: '',
    });
    return 'Reassigning sales by month, check your task list for status';
  }
}

import { Controller, UseGuards, Get, Param, Query } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpertsInterval } from './expertsInterval.entity';
import { ExpertsIntervalsService } from './expertsIntervals.service';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { RolesGuard } from 'modules/auth/guards/roles.guard';

@Crud({
  model: {
    type: ExpertsInterval,
  },
  routes: {
    createOneBase: {
      decorators: [Roles('autotrain', 'admin')],
    },
    createManyBase: {
      decorators: [Roles('autotrain', 'admin')],
    },
    updateOneBase: {
      decorators: [Roles('autotrain', 'admin')],
    },
    replaceOneBase: {
      decorators: [Roles('autotrain', 'admin')],
    },
    deleteOneBase: {
      decorators: [Roles('autotrain', 'admin')],
    },
  },
})
@Controller('expertsIntervals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpertsIntervalsController
  implements CrudController<ExpertsInterval> {
  constructor(public service: ExpertsIntervalsService) {}

  @Get('date/:year-:month-:day')
  @Roles('nodo', 'admin', 'autotrain')
  async getExpertsIntervalsByDate(
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
    @Query('model') model: string = null,
  ) {
    const requestedDate = new Date(year, month - 1, day);
    const intervals = await this.service.getAvailableIntervalsByDate(
      requestedDate,
      model,
    );

    return intervals;
  }
}

import {
  Controller,
  Get,
  UseGuards,
  Param,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
  Body,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { Crud } from '@nestjsx/crud';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { Funnel } from './funnel.entity';
import { DdpFunnelsService } from './ddpFunnel.service';
import { DdpFunnelDto } from './dto/DdpFunnel.dto';
import { differenceInCalendarMonths, isAfter } from 'date-fns';
import { DdpFunnel } from './ddpFunnel.entity';
import { SalesService } from 'modules/sales/sales.service';
import { LeadsService } from 'modules/leads/leads.service';
import { DealerGroupsService } from 'modules/dealers/dealerGroups.service';
import { DealerGroup } from 'modules/dealers/dealerGroup.entity';
import { UsersService } from 'modules/users/users.service';
import { UtilitiesService } from 'modules/utilities/utilities.service';

@Crud({
  model: {
    type: Funnel,
  },
  query: {
    join: {
      cityAliases: { eager: false },
    },
  },
})
@Controller('ddp-funnel')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
  }),
)
@UseInterceptors(ClassSerializerInterceptor)
export class DdpFunnelsController {
  constructor(
    private usersService: UsersService,
    private funnelsService: DdpFunnelsService,
    private salesService: SalesService,
    private leadsService: LeadsService,
    private dealerGroupService: DealerGroupsService,
    private utilityService: UtilitiesService,
  ) {}

  @Roles('dealer', 'admin', 'gm')
  @Get('global')
  async searchGlobalFunnels(@Request() req) {
    const isAdmin =
      req.user.roles.indexOf('admin') >= 0 || req.user.roles.indexOf('gm') >= 0;
    let dealerToLookFor: DealerGroup | { id: 'all'; name: string };
    if (isAdmin) {
      dealerToLookFor = {
        id: 'all',
        name: 'Promedio GM',
      };
    } else {
      const user = await this.usersService.findOne(req.user.userId, {
        relations: ['dealerGroup'],
      });
      dealerToLookFor = user.dealerGroup;
    }
    const response: (DdpFunnel & {
      totalSales: number;
      totalLeads: number;
    })[] = [];
    const validLeads = await this.leadsService.getYearValidLeadsForDealer(
      dealerToLookFor.id,
      true,
    );
    const sales = await this.salesService.getYearSalesForDealer(
      dealerToLookFor.id,
      true,
    );

    const periods = this.utilityService.get12MonthsFromNowPeriods();

    for (const period of periods) {
      const totalLeads = validLeads.find(l => l.period === period);
      const totalSales = sales.find(s => s.period === period);
      const periodParts = period.split('-');
      let funnelsForMonth: DdpFunnel[];
      if (dealerToLookFor.id === 'all') {
        funnelsForMonth = await this.funnelsService.findByYearMonth(
          periodParts[0],
          parseInt(periodParts[1]),
        );
      } else {
        funnelsForMonth = await this.funnelsService.findAllByYearMonthAndDealer(
          periodParts[0],
          parseInt(periodParts[1]),
          dealerToLookFor.id,
        );
      }

      if (funnelsForMonth.length > 0) {
        response.push({
          ...this.funnelsService.mergeDDPFunnels(funnelsForMonth),
          dealer: (dealerToLookFor as unknown) as DealerGroup,
          year: periodParts[0],
          month: parseInt(periodParts[1]),
          totalLeads: totalLeads.count,
          totalSales: totalSales.count,
        });
      } else {
        response.push({
          // In this case just copy the attributes from the first
          // funnel but replace the actual data with 0s
          dealer: dealerToLookFor as DealerGroup,
          year: periodParts[0],
          month: parseInt(periodParts[1]),
          id: parseInt(periodParts[1]),
          createdAt: new Date(),
          updatedAt: new Date(),
          totalLeads: totalLeads.count,
          totalSales: totalSales.count,
          ...this.funnelsService.getEmptyT1Funnel(),
        });
      }
    }

    return response;
  }

  @Roles('dealer', 'admin', 'gm')
  @Get(':dealerId')
  async searchDDPFunnel(@Param('dealerId') dealerId: number) {
    const dealer = await this.dealerGroupService.findOne(dealerId);
    if (!dealer) {
      throw new HttpException(
        'That dealer does not exists',
        HttpStatus.NOT_FOUND,
      );
    }

    const response: (DdpFunnel & {
      totalSales: number;
      totalLeads: number;
    })[] = [];
    const validLeads = await this.leadsService.getYearValidLeadsForDealer(
      dealerId,
      true,
    );
    const sales = await this.salesService.getYearSalesForDealer(dealerId, true);

    const periods = this.utilityService.get12MonthsFromNowPeriods();

    // Go through the 12 months of the year and fill in the gaps where no data is available with 0s
    for (const period of periods) {
      const totalLeads = validLeads.find(l => l.period === period);
      const totalSales = sales.find(s => s.period === period);
      const periodParts = period.split('-');
      const funnelForMonth = await this.funnelsService.findByYearMonthAndDealer(
        periodParts[0],
        parseInt(periodParts[1]),
        dealerId,
      );

      if (funnelForMonth) {
        response.push({
          ...funnelForMonth,
          totalLeads: totalLeads.count,
          totalSales: totalSales.count,
        });
      } else {
        response.push({
          // In this case just copy the attributes from the first
          // funnel but replace the actual data with 0s
          dealer: dealer,
          year: periodParts[0],
          month: parseInt(periodParts[1]),
          id: parseInt(periodParts[1]),
          createdAt: new Date(),
          updatedAt: new Date(),
          totalLeads: totalLeads.count,
          totalSales: totalSales.count,
          ...this.funnelsService.getEmptyT1Funnel(),
        });
      }
    }

    return response;
  }

  @Roles('dealer', 'admin', 'gm')
  @Post(':dealerId/:year-:month')
  async createDDPFunnel(
    @Param('dealerId') dealerId: number,
    @Param('year') year: number,
    @Param('month') month: number,
    @Body() body: DdpFunnelDto,
  ) {
    // Use the first day of the month for comparisons
    const today = new Date();
    today.setDate(1);
    const requestedDate = new Date(year, month - 1, 1); // Se crea la fecha con un mes menos porque en JS inicia en 0
    if (isAfter(requestedDate, today)) {
      throw new HttpException(
        "You can't update records in the future",
        HttpStatus.BAD_REQUEST,
      );
    }
    if (differenceInCalendarMonths(today, requestedDate) > 4) {
      throw new HttpException(
        "You can't update records older than 5 months",
        HttpStatus.BAD_REQUEST,
      );
    }
    const searchMonth = requestedDate.getMonth() + 1;
    const funnel = await this.funnelsService.findByYearMonthAndDealer(
      year,
      searchMonth,
      dealerId,
    );
    if (funnel) {
      await this.funnelsService.repo.update(funnel.id, body);
      const updatedFunnel = await this.funnelsService.findOne(funnel.id, {
        relations: ['dealer'],
      });
      await this.dealerGroupService.increaseSavesCounter(dealerId);
      return updatedFunnel;
    } else {
      const newFunnel = this.funnelsService.repo.create({
        month: searchMonth,
        year,
        dealer: { id: dealerId },
        ...body,
      });
      const { id } = await this.funnelsService.repo.save(newFunnel);
      const createdFunnel = await this.funnelsService.findOne(id, {
        relations: ['dealer'],
      });
      return createdFunnel;
    }
  }
}

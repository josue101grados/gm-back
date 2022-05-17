import {
  Controller,
  UseGuards,
  Get,
  Query,
  Param,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { SourcedLeadsService } from './sourcedLeads.service';
import { LeadsService } from './leads.service';
import { Brackets, Like } from 'typeorm';
import { UsersService } from 'modules/users/users.service';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(
    private sourcedLeadsService: SourcedLeadsService,
    private leadsService: LeadsService,
    private usersService: UsersService,
  ) {}

  @Get('download-leads-for-siebel')
  @Roles('admin', 'callcenter')
  async downloadLeadsforSiebel() {
    const documentLink = await this.sourcedLeadsService.generateLeadsForSiebelFile();

    if (documentLink) {
      return {
        message: '',
        documentLink,
      };
    }

    return {
      message: 'No hay leads pendientes de descarga',
      documentLink: null,
    };
  }

  @Get('sourced-leads-by-external-form')
  @Roles('admin', 'gm')
  async sourcedleadsByExternalForm(
    @Query('from') from,
    @Query('to') to,
    @Query('generateReport') generateReport,
  ) {
    if (generateReport === 'true') {
      // Send the report url
      return await this.sourcedLeadsService.sourcedleadsByExternalForm(
        from,
        to,
        true,
      );
    } else {
      // Send the report results
      return await this.sourcedLeadsService.sourcedleadsByExternalForm(
        from,
        to,
        false,
      );
    }
  }

  @Get('search')
  @Roles('admin', 'dealer', 'gm', 'callcenter-dealer', 'supervisor-dealer')
  async searchLead(@Req() req, @Query('search') search: string) {
    let userDealerGroupId: number;
    const userIsAdmin =
      req.user.roles.indexOf('admin') >= 0 || req.user.roles.indexOf('gm') >= 0;
    if (!userIsAdmin) {
      const fullUser = await this.usersService.findOne(req.user.userId, {
        relations: ['dealerGroup'],
      });
      userDealerGroupId = fullUser.dealerGroup.id;
    }
    const lead = this.leadsService.searchLead(search, userDealerGroupId);
    if (!lead) throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
    return lead;
  }

  @Get('search/:id/:instance')
  // @Roles('admin', 'dealer')
  async searchLeadByIdAndInstance(@Param() params) {
    console.log(params);
    return true;
  }
}

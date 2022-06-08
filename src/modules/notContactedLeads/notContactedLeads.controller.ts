import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { NotContactedLeadsService } from './notContactedLeads.service';
import {
  ValidationStatus,
  JustificationObservation,
} from './notContactedLeads.entity';

@Controller('not-contacted-leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotContactedLeadsController {
  constructor(private notContactedLeadsService: NotContactedLeadsService) {}

  @Get()
  @Roles('dealer', 'admin', 'gm')
  async getNotContactedLeads(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('dealerGroupId') dealerGroupId: string,
  ) {
    return await this.notContactedLeadsService.getNotContactedLeads(
      parseInt(year),
      parseInt(month),
      dealerGroupId,
    );
  }

  @Get('/last/:toObtain')
  @Roles('dealer', 'admin', 'gm')
  async getUploadsInfo(@Param('toObtain') toObtain: number) {
    return this.notContactedLeadsService.getLatestUploads(toObtain);
  }

  @Get('/download')
  @Roles('dealer', 'admin', 'gm')
  async downloadExcel(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('dealerGroupId') dealerGroupId: string,
  ) {
    return this.notContactedLeadsService.generateExcel(
      parseInt(year),
      parseInt(month),
      dealerGroupId,
    );
  }

  @Patch('/:opName')
  @Roles('admin', 'gm')
  async updateStatus(
    @Param('opName') opName: string,
    @Query('status') status: ValidationStatus,
    @Query('justificationObservation')
    justificationObservation: JustificationObservation,
  ) {
    return this.notContactedLeadsService.updateAllStatus(
      opName,
      status,
      justificationObservation,
    );
  }
}

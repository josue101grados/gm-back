import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SalesAssignationsService } from './salesAssignations.service';
import {
  CreateSaleAssignationDto,
  UpdateSaleAssignationDto,
} from './saleAssignation.dto';

@ApiTags('sales-assignations')
@Controller('sales-assignations')
export class SalesAssignationsController {
  constructor(private salesAssignationsService: SalesAssignationsService) {}

  @Post()
  async create(@Body() payload: CreateSaleAssignationDto) {
    return await this.salesAssignationsService.create(payload);
  }
}

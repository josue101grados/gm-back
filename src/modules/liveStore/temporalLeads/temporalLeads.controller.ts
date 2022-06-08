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

import { TemporalLeadsService } from './temporalLeads.service';
import {
  CreateTemporalLeadDto,
  UpdateTemporalLeadDto,
} from './temporalLead.dto';

@ApiTags('temporal-leads')
@Controller('temporal-leads')
export class TemporalLeadsController {
  constructor(private temporalLeadsService: TemporalLeadsService) {}

  @Get()
  async findAll() {
    return await this.temporalLeadsService.findAll();
  }

  @Get('/:id')
  async getCategory(@Param('id') id: number) {
    return await this.temporalLeadsService.findOne(id);
  }

  @Post()
  async create(@Body() payload: CreateTemporalLeadDto) {
    return await this.temporalLeadsService.create(payload);
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateTemporalLeadDto,
  ) {
    return await this.temporalLeadsService.update(id, payload);
  }

  @Delete('/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.temporalLeadsService.remove(id);
  }
}

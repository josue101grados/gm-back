import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdvisersService } from './advisers.service';
import {
  CreateAdviserDto,
  UpdateAdviserDto,
  FilterAdvisersDto,
} from './adviser.dto';

@ApiTags('advisers')
@Controller('advisers')
export class AdvisersController {
  constructor(private advisersService: AdvisersService) {}

  @Get()
  async findAll(@Query() params: FilterAdvisersDto) {
    return await this.advisersService.findAll(params ? params : null);
  }

  @Get('/:id')
  async getCategory(@Param('id') id: number) {
    return await this.advisersService.findOne(id);
  }

  @Post()
  async create(@Body() payload: CreateAdviserDto) {
    return await this.advisersService.create(payload);
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateAdviserDto,
  ) {
    return await this.advisersService.update(id, payload);
  }

  @Delete('/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.advisersService.remove(id);
  }
}

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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { format } from 'date-fns';

import { LiveStoreService } from './liveStore.service';
import {
  CreateLiveStoreDto,
  UpdateLiveStoreDto,
  FilterLiveStoreDto,
} from './liveStore.dto';

@ApiTags('live-store')
@Controller('live-store')
export class LiveStoreController {
  constructor(private liveStoreService: LiveStoreService) {}

  @Get()
  async findAll(@Query() params: FilterLiveStoreDto) {
    return await this.liveStoreService.findAll(params ? params : null);
  }

  @Get('/:id')
  async getCategory(@Param('id') id: number) {
    return await this.liveStoreService.findOne(id);
  }

  @Get('/lead/:mobileOrDocument')
  async getLead(@Param('mobileOrDocument') mobileOrDocument: string) {
    return await this.liveStoreService.findLead(mobileOrDocument);
  }

  @Post('/download')
  async downloadExcel(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('dealerGroupId') dealerGroupId: string,
  ) {
    return this.liveStoreService.downloadExcel(
      parseInt(month),
      parseInt(year),
      dealerGroupId,
    );
  }

  @Post('/download/gmf')
  async downloadGMFExcel(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('dealerGroupId') dealerGroupId: string,
  ) {
    return this.liveStoreService.downloadGMFExcel(
      parseInt(month),
      parseInt(year),
      dealerGroupId,
    );
  }

  @Post()
  async create(@Body() payload: CreateLiveStoreDto) {
    return await this.liveStoreService.create(payload);
  }

  @Post('/upload/gmf')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'temp/',
        filename: (req, file, cb) => {
          const [name, ext] = file.originalname.split('.');
          cb(
            null,
            `${name}-${format(new Date(), 'dd-MM-yyyy-HH:mm:ss')}.${ext}`,
          );
        },
      }),
    }),
  )
  async uploadGMF(@UploadedFile() file) {
    const { path, filename } = file;
    return await this.liveStoreService.uploadGMF(path, filename);
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateLiveStoreDto,
  ) {
    return await this.liveStoreService.update(id, payload);
  }

  @Delete('/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.liveStoreService.remove(id);
  }
}

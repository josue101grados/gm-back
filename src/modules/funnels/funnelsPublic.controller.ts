import {
  Controller,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
  HttpCode,
  Patch,
  Post,
  Body,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Funnel } from './funnel.entity';
import { FunnelsService } from './funnels.service';
import { InstanceGuard } from 'modules/auth/guards/instance.guard';
import { MarkFunnelAsDownloaded } from './dto/MarkFunnelAsDownloaded.dto';
import { ValidateFunnelRowsToUpload } from './dto/ValidateFunnelRowsToUpload.dto';
import { UpdateFunnelRows } from './dto/UpdateFunnelRows.dto';

@Controller('funnels_public')
@UsePipes(ValidationPipe)
export class FunnelsPublicController {
  constructor(private service: FunnelsService) {}

  @Get('save_click')
  async saveClick(@Query() params, @Res() res) {
    let type = null;
    let crypted = null;
    if (params.header) {
      type = 'header';
      crypted = params.header;
    }
    if (params.model) {
      type = 'model';
      crypted = params.model;
    }
    if (params.callUs) {
      type = 'callUs';
      crypted = params.callUs;
    }
    if (params.whatsapp) {
      type = 'whatsapp';
      crypted = params.whatsapp;
    }
    if (params.location) {
      type = 'location';
      crypted = params.location;
    }
    if (params.livestoreWhatsapp) {
      type = 'livestoreWhatsapp';
      crypted = params.livestoreWhatsapp;
    }
    if (params.livestoreHeader) {
      type = 'livestoreHeader';
      crypted = params.livestoreHeader;
    }
    if (type !== null) {
      const url = await this.service.saveClick(type, crypted);
      return res.redirect(url);
    } else {
      throw new HttpException('An error ocurred', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(InstanceGuard)
  @HttpCode(204)
  @Post('mark_downloaded')
  async markFunnelsAsDownloaded(
    @Body() markDownloadedBody: MarkFunnelAsDownloaded,
  ) {
    const updated = await this.service.markFunnelsAsDownloaded(
      markDownloadedBody.funnelIds,
    );
    return updated;
  }

  @UseGuards(InstanceGuard)
  @Post('validate_for_upload')
  async validateFunnelRowsToUpload(
    @Body() validateBody: ValidateFunnelRowsToUpload,
  ): Promise<string[]> {
    return await this.service.validateFunnelRows(validateBody.rows);
  }

  @UseGuards(InstanceGuard)
  @HttpCode(204)
  @Patch('update_funnels')
  async updateFunnelRows(@Body() updateBody: UpdateFunnelRows): Promise<void> {
    return await this.service.updateFunnelRows(updateBody.rows);
  }
}

import {
  Controller,
  Get,
  Req,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { NotContactedLeadsAttachmentsService } from './attachments.service';
import { Roles } from 'modules/auth/guards/roles.decorator';

@Controller('not-contacted-leads-attachments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotContactedLeadsAttachmentController {
  constructor(
    private notContactedLeadsAttachmentsService: NotContactedLeadsAttachmentsService,
  ) {}

  @Post('/:opName')
  @Roles('dealer', 'admin', 'gm')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'temp/',
        filename: (req, file, cb) => {
          const [name, ext] = file.originalname.split('.');
          cb(null, `${name}-${Date.now()}.${ext}`);
        },
      }),
    }),
  )
  async uploadAttachment(
    @UploadedFile() file,
    @Param('opName') opName: string,
  ) {
    return await this.notContactedLeadsAttachmentsService.uploadAttachment(
      opName,
      file,
    );
  }

  @Get('/:nclId')
  @Roles('dealer', 'admin', 'gm')
  async getAttachments(@Param('nclId') nclId: number) {
    return await this.notContactedLeadsAttachmentsService.getAttachments(nclId);
  }
}

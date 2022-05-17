import {
  Controller,
  UseInterceptors,
  Param,
  Post,
  UseGuards,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Crud, CrudController } from '@nestjsx/crud';
import { DealerDealership } from './dealerDealership.entity';
import { DealerDealershipsService } from './dealerDealerships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from 'modules/uploads/uploads.service';

@Crud({
  model: {
    type: DealerDealership,
  },
  query: {
    join: {
      dealerCity: { eager: true },
      dealerGroup: { eager: true },
      city: { eager: true },
      dealerDealershipAliases: { eager: true },
    },
  },
})
@Controller('dealers')
@UseGuards(JwtAuthGuard)
export class DealerDealershipsController
  implements CrudController<DealerDealership> {
  constructor(
    public service: DealerDealershipsService,
    public uploadService: UploadsService,
  ) {}
  @Post(':id/image')
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
  async uploadImage(@UploadedFile() file, @Param('id') id) {
    const dealer = await this.service.findOne(id);
    if (!dealer) {
      await this.uploadService.deleteFile(file.path);
      throw new HttpException('Dealer not found', HttpStatus.NOT_FOUND);
    }
    const fileDestination = `dealers/${file.filename}`;
    const uploadResult = await this.uploadService.uploadToGoogleAndMakePublic(
      file.path,
      fileDestination,
    );
    if (dealer.image) {
      await this.uploadService.deleteFileByPublicUrl(dealer.image);
    }
    await this.service.updateImage(id, uploadResult);
    // Delete local image file
    await this.uploadService.deleteFile(file.path);
  }
}

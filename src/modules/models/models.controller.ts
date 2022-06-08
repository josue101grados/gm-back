import {
  Controller,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Model } from './model.entity';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { ModelsService } from './models.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from 'modules/uploads/uploads.service';

@Crud({
  model: {
    type: Model,
  },
  query: {
    join: {
      modelAliases: { eager: true },
      segment: { eager: true },
    },
  },
})
@Controller('models')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModelsController implements CrudController<Model> {
  constructor(
    public service: ModelsService,
    public uploadService: UploadsService,
  ) {}

  @Post(':id/image/:type')
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
  async uploadImage(
    @UploadedFile() file,
    @Param('id') id,
    @Param('type') type,
  ) {
    const model = await this.service.findOne(id);
    if (!model) {
      await this.uploadService.deleteFile(file.path);
      throw new HttpException('Model not found', HttpStatus.NOT_FOUND);
    }
    const fileDestination = `models/${file.filename}`;
    const uploadResult = await this.uploadService.uploadToGoogleAndMakePublic(
      file.path,
      fileDestination,
    );
    if (type === 'additional') {
      // Delete the additional image if it previously existed
      if (model.additionalImage) {
        await this.uploadService.deleteFileByPublicUrl(model.additionalImage);
      }
      await this.service.updateAdditionalImage(id, uploadResult);
    } else if (type === 'main') {
      // Delete the image if it previously existed
      if (model.image) {
        await this.uploadService.deleteFileByPublicUrl(model.image);
      }
      await this.service.updateImage(id, uploadResult);
    }
    await this.uploadService.deleteFile(file.path);
  }
}

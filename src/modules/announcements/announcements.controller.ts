import {
  Controller,
  Param,
  UploadedFile,
  UseGuards,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
  Req,
  Get,
} from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Announcement } from './announcement.entity';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from 'modules/uploads/uploads.service';
import { UsersService } from 'modules/users/users.service';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';

@Crud({
  model: {
    type: Announcement,
  },
  query: {
    join: {
      dealerGroup: { eager: true },
    },
  },
})
@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController implements CrudController<Announcement> {
  constructor(
    public service: AnnouncementsService,
    private uploadService: UploadsService,
    private usersService: UsersService,
  ) {}

  @Roles('admin')
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
    const announcement = await this.service.findOne(id);
    if (!announcement) {
      await this.uploadService.deleteFile(file.path);
      throw new HttpException('Announcement not found', HttpStatus.NOT_FOUND);
    }
    const fileDestination = `announcement/${file.filename}`;
    const uploadResult = await this.uploadService.uploadToGoogleAndMakePublic(
      file.path,
      fileDestination,
    );

    if (announcement.image) {
      await this.uploadService.deleteFileByPublicUrl(announcement.image);
    }
    await this.service.updateImage(id, uploadResult);
    await this.uploadService.deleteFile(file.path);
  }

  @Roles('admin', 'dealer', 'gm')
  @Get('home')
  async queryHomeAnnouncements(@Req() req) {
    const user = await this.usersService.findOne({
      where: { id: req.user.userId, status: 'ACTIVO' },
      relations: ['dealerGroup'],
    });
    return await this.service.find({
      where: [
        { dealerGroup: null, status: 'ACTIVO' },
        { dealerGroup: user.dealerGroup, status: 'ACTIVO' },
      ],
    });
  }
}

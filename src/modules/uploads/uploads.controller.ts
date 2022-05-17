import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { ValidationsService } from './validations.service';
import { TasksService } from 'modules/tasks/tasks.service';
import { TaskTypes } from 'modules/tasks/task.entity';
import { UploadSalesDto } from './dto/uploadSales.dto';
import { UploadSourcesDto } from './dto/uploadSources.dto';
import { CampaignsService } from 'modules/campaigns/campaigns.service';
import { JwtToken } from '../auth/strategies/jwt.dto';
import { UsersService } from '../users/users.service';
import { User } from 'modules/users/user.entity';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
  constructor(
    private uploads: UploadsService,
    private validations: ValidationsService,
    private tasksService: TasksService,
    private campaignService: CampaignsService,
    private usersService: UsersService,
  ) {}

  @Post('direct')
  @Roles('admin')
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
  async uploadDirect(@Req() req, @UploadedFile() file) {
    try {
      await this.validations.validateDirectUpload(file.path);
    } catch (e) {
      // If validation was not successful, delete the file
      this.uploads.deleteFile(file.path);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
    const fileName = await this.uploads.uploadToGoogle(
      file.path,
      `uploads/direct-uploads/files/${file.filename}`,
    );
    // delete the file after it's uploaded to google
    this.uploads.deleteFile(file.path);
    await this.tasksService.createTask({
      type: TaskTypes.DIRECTS_UPLOAD,
      filePath: fileName,
      user: req.user,
    });
    return 'File was uplodaded';
  }

  @Post('sales')
  @Roles('admin')
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
  async uploadSales(
    @Req() req,
    @UploadedFile() file,
    @Body() { year, month }: UploadSalesDto,
  ) {
    if (new Date(`${year}-${month}`).toString() === 'Invalid Date') {
      this.uploads.deleteFile(file.path);
      throw new HttpException(
        'La fecha seleccionada es inválida',
        HttpStatus.CONFLICT,
      );
    }
    try {
      await this.validations.validateSales(file.path);
    } catch (e) {
      // If validation was not successful, delete the file
      this.uploads.deleteFile(file.path);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
    const fileName = await this.uploads.uploadToGoogle(
      file.path,
      `uploads/sales-uploads/files/${file.filename}`,
    );
    // delete the file after it's uploaded to google
    this.uploads.deleteFile(file.path);
    await this.tasksService.createTask({
      type: TaskTypes.SALES_UPLOAD,
      filePath: fileName,
      user: req.user,
      data: {
        year,
        month,
      },
    });
    return 'File was uplodaded';
  }

  @Post('not-contacted-leads')
  @Roles('admin', 'gm')
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
  async uploadNotContactedLeads(
    @Req() req,
    @UploadedFile() file,
    @Body() { year, month }: UploadSalesDto,
  ) {
    if (new Date(`${year}-${month}`).toString() === 'Invalid Date') {
      this.uploads.deleteFile(file.path);
      throw new HttpException(
        'La fecha seleccionada es inválida',
        HttpStatus.CONFLICT,
      );
    }
    try {
      await this.validations.validateNotContactedLeads(file.path);
    } catch (e) {
      // If validation was not successful, delete the file
      this.uploads.deleteFile(file.path);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
    const fileName = await this.uploads.uploadToGoogle(
      file.path,
      `uploads/not-contacted-leads-uploads/files/${file.filename}`,
    );
    // delete the file after it's uploaded to google
    this.uploads.deleteFile(file.path);
    await this.tasksService.createTask({
      type: TaskTypes.CONTACTABILITY_UPLOAD,
      filePath: fileName,
      user: req.user,
      data: {
        year,
        month,
      },
    });
    return 'File was uplodaded';
  }

  @Post('live-store')
  @Roles('admin', 'gm', 'dealer')
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
  async uploadLiveStore(
    @Req() req,
    @UploadedFile() file,
    @Body() { year, month }: UploadSalesDto,
  ) {
    if (new Date(`${year}-${month}`).toString() === 'Invalid Date') {
      this.uploads.deleteFile(file.path);
      throw new HttpException(
        'La fecha seleccionada es inválida',
        HttpStatus.CONFLICT,
      );
    }
    try {
      await this.validations.validateLiveStore(file.path);
    } catch (e) {
      // If validation was not successful, delete the file
      this.uploads.deleteFile(file.path);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
    const fileName = await this.uploads.uploadToGoogle(
      file.path,
      `uploads/live-store/files/${file.filename}`,
    );
    // delete the file after it's uploaded to google
    this.uploads.deleteFile(file.path);
    const userJwt = req.user as JwtToken;
    const user = await this.usersService.findById(userJwt.userId);
    console.log(req.user);
    await this.tasksService.createTask({
      type: TaskTypes.LIVE_STORE_UPLOAD,
      filePath: fileName,
      user,
      data: {
        year,
        month,
      },
    });
    return 'File was uplodaded';
  }

  @Post('sources')
  @Roles('admin', 'callcenter')
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
  async uploadSources(
    @Req() req,
    @UploadedFile() file,
    @Body() { source, campaign }: UploadSourcesDto,
  ) {
    const foundCampaign = await this.campaignService.findOne(campaign);
    if (!foundCampaign) {
      throw new HttpException('Campaign not found', HttpStatus.CONFLICT);
    }
    try {
      await this.validations.validateSources(file.path, source);
    } catch (e) {
      // If validation was not successful, delete the file
      this.uploads.deleteFile(file.path);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
    const fileName = await this.uploads.uploadToGoogle(
      file.path,
      `uploads/sources-uploads/files/${file.filename}`,
    );
    // delete the file after it's uploaded to google
    this.uploads.deleteFile(file.path);
    await this.tasksService.createTask({
      type: TaskTypes.SOURCES_UPLOAD,
      filePath: fileName,
      user: req.user,
      data: {
        campaignId: foundCampaign.id,
        source,
      },
    });
    return 'File was uplodaded';
  }

  @Post('funnel')
  @Roles('admin', 'inxait')
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
  async upload(@Req() req, @UploadedFile() file) {
    try {
      await this.validations.validateFunnel(file.path);
    } catch (e) {
      // If validation was not successful, delete the file
      this.uploads.deleteFile(file.path);
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
    const fileName = await this.uploads.uploadToGoogle(
      file.path,
      `uploads/funnels-uploads/files/${file.filename}`,
    );
    // delete the file after it's uploaded to google
    this.uploads.deleteFile(file.path);
    await this.tasksService.createTask({
      type: TaskTypes.FUNNEL_UPLOAD,
      filePath: fileName,
      user: req.user,
    });
    return 'File was uplodaded';
  }
}

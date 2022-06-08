import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './announcement.entity';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { UploadsModule } from 'modules/uploads/uploads.module';
import { UsersModule } from 'modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement]),
    UploadsModule,
    UsersModule,
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailgunEvent } from './mailgunEvent.entity';
import { MailgunEventsController } from './mailgunEvents.controller';
import { MailgunEventsService } from './mailgunEvents.service';

@Module({
  imports: [TypeOrmModule.forFeature([MailgunEvent])],
  controllers: [MailgunEventsController],
  providers: [MailgunEventsService],
})
export class MailgunEventsModule {}

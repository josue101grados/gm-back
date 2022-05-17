import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MailgunEventsService } from './mailgunEvents.service';
import { RegisterEventDto } from './dto/RegisterEvent.dto';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Controller('mailgun-events')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
export class MailgunEventsController {
  webhookSigningKey: string;

  constructor(
    public service: MailgunEventsService,
    public configService: ConfigService,
  ) {
    this.webhookSigningKey = this.configService.get(
      'MAILGUN_WEBHOOK_SIGNING_KEY',
    );
  }

  @Post()
  @HttpCode(200)
  async mailgunWebhook(@Body() body: RegisterEventDto) {
    const value = body.signature.timestamp + body.signature.token;
    const hash = createHmac('sha256', this.webhookSigningKey)
      .update(value)
      .digest('hex');
    if (hash !== body.signature.signature) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }
    await this.service.registerEvent(
      body['event-data'].recipient,
      body['event-data'].event,
      body['event-data'],
    );
  }
}

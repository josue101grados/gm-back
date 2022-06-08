import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { MailgunEvent } from './mailgunEvent.entity';

@Injectable()
export class MailgunEventsService extends TypeOrmCrudService<MailgunEvent> {
  constructor(@InjectRepository(MailgunEvent) repo) {
    super(repo);
  }
  public async registerEvent(recipient: string, event: string, data: any) {
    const newEvent = this.repo.create();
    newEvent.recipient = recipient;
    newEvent.event = event;
    newEvent.data = data;
    await this.repo.save(newEvent);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Announcement } from './announcement.entity';

@Injectable()
export class AnnouncementsService extends TypeOrmCrudService<Announcement> {
  constructor(@InjectRepository(Announcement) repo) {
    super(repo);
  }
  async updateImage(id: number, image: string) {
    return this.repo.update(id, { image });
  }
}

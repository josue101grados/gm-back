import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Segment } from './segment.entity';

@Injectable()
export class SegmentsService extends TypeOrmCrudService<Segment> {
  constructor(@InjectRepository(Segment) repo) {
    super(repo);
  }
}

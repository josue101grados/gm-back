import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Zone } from './zone.entity';

@Injectable()
export class ZonesService extends TypeOrmCrudService<Zone> {
  constructor(@InjectRepository(Zone) repo) {
    super(repo);
  }
}

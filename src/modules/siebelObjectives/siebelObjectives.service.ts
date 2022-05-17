import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { SiebelObjective } from './siebelObjective.entity';

@Injectable()
export class SiebelObjectivesService extends TypeOrmCrudService<
  SiebelObjective
> {
  constructor(@InjectRepository(SiebelObjective) repo) {
    super(repo);
  }
}

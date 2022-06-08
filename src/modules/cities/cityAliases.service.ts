import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CityAlias } from './cityAlias.entity';

@Injectable()
export class CityAliasesService extends TypeOrmCrudService<CityAlias> {
  constructor(@InjectRepository(CityAlias) repo) {
    super(repo);
  }
}

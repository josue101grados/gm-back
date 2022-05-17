import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ModelAlias } from './modelAlias.entity';

@Injectable()
export class ModelAliasesService extends TypeOrmCrudService<ModelAlias> {
  constructor(@InjectRepository(ModelAlias) repo) {
    super(repo);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DealerDealershipAlias } from './dealerDealershipAlias.entity';

@Injectable()
export class DealerDealershipAliasesService extends TypeOrmCrudService<
  DealerDealershipAlias
> {
  constructor(@InjectRepository(DealerDealershipAlias) repo) {
    super(repo);
  }
}

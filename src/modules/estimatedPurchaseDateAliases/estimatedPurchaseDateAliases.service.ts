import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { EstimatedPurchaseDateAlias } from './estimatedPurchaseDateAlias.entity';

@Injectable()
export class EstimatedPurchaseDateAliasesService extends TypeOrmCrudService<
  EstimatedPurchaseDateAlias
> {
  constructor(@InjectRepository(EstimatedPurchaseDateAlias) repo) {
    super(repo);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CampaignAlias } from './campaignAlias.entity';

@Injectable()
export class CampaignAliasesService extends TypeOrmCrudService<CampaignAlias> {
  constructor(@InjectRepository(CampaignAlias) repo) {
    super(repo);
  }
}

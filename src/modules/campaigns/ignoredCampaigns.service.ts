import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { IgnoredCampaign } from './ignoredCampaign.entity';

@Injectable()
export class IgnoredCampaignsService extends TypeOrmCrudService<
  IgnoredCampaign
> {
  constructor(@InjectRepository(IgnoredCampaign) repo) {
    super(repo);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './campaign.entity';
import { CampaignAlias } from './campaignAlias.entity';
import { IgnoredCampaign } from './ignoredCampaign.entity';
import { CampaignsController } from './campaigns.controller';
import { CampaignAliasesController } from './campaignAliases.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignAliasesService } from './campaignAliases.service';
import { IgnoredCampaignsService } from './ignoredCampaigns.service';
import { IgnoredCampaignsController } from './ignoredCampaigns.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign]),
    TypeOrmModule.forFeature([CampaignAlias]),
    TypeOrmModule.forFeature([IgnoredCampaign]),
  ],
  controllers: [
    CampaignsController,
    CampaignAliasesController,
    IgnoredCampaignsController,
  ],
  providers: [
    CampaignsService,
    CampaignAliasesService,
    IgnoredCampaignsService,
  ],
  exports: [CampaignsService, IgnoredCampaignsService],
})
export class CampaignsModule {}

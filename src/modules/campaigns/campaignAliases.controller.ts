import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { CampaignAlias } from './campaignAlias.entity';
import { CampaignAliasesService } from './campaignAliases.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: CampaignAlias,
  },
})
@Controller('campaignAliases')
@UseGuards(JwtAuthGuard)
export class CampaignAliasesController
  implements CrudController<CampaignAlias> {
  constructor(public service: CampaignAliasesService) {}
}

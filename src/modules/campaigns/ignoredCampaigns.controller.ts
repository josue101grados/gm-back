import { Controller, UseGuards } from '@nestjs/common';
import { CrudController, Crud } from '@nestjsx/crud';
import { IgnoredCampaign } from './ignoredCampaign.entity';
import { IgnoredCampaignsService } from './ignoredCampaigns.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';

@Crud({
  model: {
    type: IgnoredCampaign,
  },
  routes: {
    getManyBase: { decorators: [Roles('admin')] },
    getOneBase: { decorators: [Roles('admin')] },
    createOneBase: { decorators: [Roles('admin')] },
    createManyBase: { decorators: [Roles('admin')] },
    updateOneBase: { decorators: [Roles('admin')] },
    replaceOneBase: { decorators: [Roles('admin')] },
    deleteOneBase: { decorators: [Roles('admin')] },
  },
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ignored-campaigns')
export class IgnoredCampaignsController
  implements CrudController<IgnoredCampaign> {
  constructor(public service: IgnoredCampaignsService) {}
}

import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { DealerDealershipAlias } from './dealerDealershipAlias.entity';
import { DealerDealershipAliasesService } from './dealerDealershipAliases.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: DealerDealershipAlias,
  },
})
@Controller('dealerDealershipAliases')
@UseGuards(JwtAuthGuard)
export class DealerDealershipAliasesController
  implements CrudController<DealerDealershipAlias> {
  constructor(public service: DealerDealershipAliasesService) {}
}

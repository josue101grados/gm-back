import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { ModelAlias } from './modelAlias.entity';
import { ModelAliasesService } from './modelAliases.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: ModelAlias,
  },
})
@Controller('modelAliases')
@UseGuards(JwtAuthGuard)
export class ModelAliasesController implements CrudController<ModelAlias> {
  constructor(public service: ModelAliasesService) {}
}

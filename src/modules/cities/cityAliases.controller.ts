import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { CityAlias } from './cityAlias.entity';
import { CityAliasesService } from './cityAliases.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: CityAlias,
  },
})
@Controller('cityAliases')
@UseGuards(JwtAuthGuard)
export class CityAliasesController implements CrudController<CityAlias> {
  constructor(public service: CityAliasesService) {}
}

import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { SiebelObjective } from './siebelObjective.entity';
import { SiebelObjectivesService } from './siebelObjectives.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: SiebelObjective,
  },
})
@Controller('siebelObjectives')
@UseGuards(JwtAuthGuard)
export class SiebelObjectivesController
  implements CrudController<SiebelObjective> {
  constructor(public service: SiebelObjectivesService) {}
}

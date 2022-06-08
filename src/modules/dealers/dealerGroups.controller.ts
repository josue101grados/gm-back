import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { DealerGroup } from './dealerGroup.entity';
import { DealerGroupsService } from './dealerGroups.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: DealerGroup,
  },
})
@Controller('dealerGroups')
@UseGuards(JwtAuthGuard)
export class DealerGroupsController implements CrudController<DealerGroup> {
  constructor(public service: DealerGroupsService) {}
}

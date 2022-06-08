import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { DealerCity } from './dealerCity.entity';
import { DealerCitiesService } from './dealerCities.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: DealerCity,
  },
  query: {
    join: {
      zone: { eager: true },
      dealerGroup: { eager: true },
    },
  },
})
@Controller('dealerCities')
@UseGuards(JwtAuthGuard)
export class DealerCitiesController implements CrudController<DealerCity> {
  constructor(public service: DealerCitiesService) {}
}

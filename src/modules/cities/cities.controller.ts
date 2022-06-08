import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { City } from './city.entity';
import { CitiesService } from './cities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: City,
  },
  query: {
    join: {
      cityAliases: { eager: false },
    },
  },
})
@Controller('cities')
@UseGuards(JwtAuthGuard)
export class CitiesController implements CrudController<City> {
  constructor(public service: CitiesService) {}
}

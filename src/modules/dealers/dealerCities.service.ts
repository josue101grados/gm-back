import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DealerCity } from './dealerCity.entity';

@Injectable()
export class DealerCitiesService extends TypeOrmCrudService<DealerCity> {
  constructor(@InjectRepository(DealerCity) repo) {
    super(repo);
  }
}

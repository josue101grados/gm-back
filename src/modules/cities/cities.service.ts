import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { City } from './city.entity';
import { CityAliasesService } from './cityAliases.service';

@Injectable()
export class CitiesService extends TypeOrmCrudService<City> {
  constructor(
    @InjectRepository(City) repo,
    private aliasesService: CityAliasesService,
  ) {
    super(repo);
  }
  async findByNameOrAlias(nameOrAlias: string): Promise<City | null> {
    const result = await this.repo.findOne({ where: { name: nameOrAlias } });
    if (result) {
      return result;
    } else {
      const alias = await this.aliasesService.findOne({
        where: { name: nameOrAlias },
        relations: ['city'],
      });
      if (alias) {
        return alias.city;
      }
    }
    return null;
  }
}

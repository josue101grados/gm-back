import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './city.entity';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { CityAlias } from './cityAlias.entity';
import { CityAliasesController } from './cityAliases.controller';
import { CityAliasesService } from './cityAliases.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([City]),
    TypeOrmModule.forFeature([CityAlias]),
  ],
  controllers: [CitiesController, CityAliasesController],
  providers: [CitiesService, CityAliasesService],
  exports: [CitiesService],
})
export class CitiesModule {}

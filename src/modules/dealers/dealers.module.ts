import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerDealership } from './dealerDealership.entity';
import { DealerDealershipsController } from './dealerDealerships.controller';
import { DealerDealershipsService } from './dealerDealerships.service';
import { DealerDealershipAlias } from './dealerDealershipAlias.entity';
import { DealerGroup } from './dealerGroup.entity';
import { DealerCity } from './dealerCity.entity';
import { DealerCitiesController } from './dealerCities.controller';
import { DealerDealershipAliasesController } from './dealerDealershipAliases.controller';
import { DealerGroupsController } from './dealerGroups.controller';
import { DealerCitiesService } from './dealerCities.service';
import { DealerDealershipAliasesService } from './dealerDealershipAliases.service';
import { DealerGroupsService } from './dealerGroups.service';
import { UploadsModule } from 'modules/uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DealerDealership]),
    TypeOrmModule.forFeature([DealerDealershipAlias]),
    TypeOrmModule.forFeature([DealerGroup]),
    TypeOrmModule.forFeature([DealerCity]),
    forwardRef(() => UploadsModule),
  ],
  controllers: [
    DealerDealershipsController,
    DealerCitiesController,
    DealerDealershipAliasesController,
    DealerGroupsController,
  ],
  providers: [
    DealerDealershipsService,
    DealerCitiesService,
    DealerDealershipAliasesService,
    DealerGroupsService,
  ],
  exports: [DealerDealershipsService, DealerCitiesService, DealerGroupsService],
})
export class DealersModule {}

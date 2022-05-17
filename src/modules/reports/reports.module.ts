import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { DealersModule } from 'modules/dealers/dealers.module';
import { LeadsModule } from 'modules/leads/leads.module';
import { SalesModule } from 'modules/sales/sales.module';
import { ZonesModule } from 'modules/zones/zones.module';
import { SiebelObjectivesModule } from 'modules/siebelObjectives/siebelObjectives.module';
import { UploadsModule } from 'modules/uploads/uploads.module';
import { GeneratedReport } from './generatedReports.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'modules/users/users.module';
import { UtilitiesModule } from 'modules/utilities/utilities.module';

@Module({
  imports: [
    DealersModule,
    LeadsModule,
    SalesModule,
    ZonesModule,
    SiebelObjectivesModule,
    UploadsModule,
    UsersModule,
    TypeOrmModule.forFeature([GeneratedReport]),
    UtilitiesModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

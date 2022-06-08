import { Module, forwardRef } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Sale } from './sale.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealersModule } from 'modules/dealers/dealers.module';
import { ModelsModule } from 'modules/models/models.module';
import { CitiesModule } from 'modules/cities/cities.module';
import { LeadsModule } from 'modules/leads/leads.module';
import { UtilitiesModule } from 'modules/utilities/utilities.module';
import { SalesController } from './sales.controller';
import { TasksModule } from '../tasks/tasks.module';
import { SalesAssignationModule } from './salesAssignations/salesAssignations.module';

@Module({
  providers: [SalesService],
  imports: [
    TypeOrmModule.forFeature([Sale]),
    forwardRef(() => DealersModule),
    forwardRef(() => ModelsModule),
    CitiesModule,
    forwardRef(() => LeadsModule),
    UtilitiesModule,
    forwardRef(() => TasksModule),
    SalesAssignationModule,
  ],
  exports: [SalesService],
  controllers: [SalesController],
})
export class SalesModule {}

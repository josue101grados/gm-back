import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SalesAssignation } from './saleAssignation.entity';
import { SalesAssignationsController } from './salesAssignations.controller';
import { SalesAssignationsService } from './salesAssignations.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesAssignation])],
  controllers: [SalesAssignationsController],
  providers: [SalesAssignationsService],
  exports: [SalesAssignationsService],
})
export class SalesAssignationModule {}

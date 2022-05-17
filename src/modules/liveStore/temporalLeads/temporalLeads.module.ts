import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TemporalLead } from './temporalLead.entity';
import { TemporalLeadsController } from './temporalLeads.controller';
import { TemporalLeadsService } from './temporalLeads.service';
import { DealersModule } from '../../dealers/dealers.module';

@Module({
  imports: [TypeOrmModule.forFeature([TemporalLead]), DealersModule],
  controllers: [TemporalLeadsController],
  providers: [TemporalLeadsService],
})
export class NewLeadModule {}

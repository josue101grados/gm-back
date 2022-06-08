import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResultLeadsSales } from './resultLeadSale.entity';
import { ResultsLeadsSalesController } from './resultsLeadsSales.controller';
import { ResultsLeadsSalesService } from './resultsLeadsSales.service';
import { LeadsModule } from '../../leads/leads.module';
import { DealersModule } from '../../dealers/dealers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResultLeadsSales]),
    forwardRef(() => LeadsModule),
    DealersModule,
  ],
  controllers: [ResultsLeadsSalesController],
  providers: [ResultsLeadsSalesService],
})
export class ResultsLeadsSalesModule {}

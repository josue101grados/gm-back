import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LiveStore } from './liveStore.entity';
import { LiveStoreController } from './liveStore.controller';
import { LiveStoreService } from './liveStore.service';
import { Lead } from '../leads/lead.entity';
import { LeadsModule } from '../leads/leads.module';
import { UsersModule } from '../users/users.module';
import { AdvisersModule } from './advisers/advisers.module';
import { UploadsModule } from '../uploads/uploads.module';
import { TemporalLead } from './temporalLeads/temporalLead.entity';
import { UtilitiesModule } from '../utilities/utilities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LiveStore, Lead, TemporalLead]),
    LeadsModule,
    UsersModule,
    forwardRef(() => AdvisersModule),
    forwardRef(() => UploadsModule),
    UtilitiesModule,
  ],
  controllers: [LiveStoreController],
  providers: [LiveStoreService],
  exports: [LiveStoreService],
})
export class LiveStoreModule {}

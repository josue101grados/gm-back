import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funnel } from './funnel.entity';
import { FunnelsController } from './funnels.controller';
import { FunnelsService } from './funnels.service';
import { UtilitiesModule } from 'modules/utilities/utilities.module';
import { UploadsModule } from 'modules/uploads/uploads.module';
import { FunnelsPublicController } from './funnelsPublic.controller';
import { T1FunnelsService } from './t1Funnel.service';
import { T1Funnel } from './t1Funnel.entity';
import { DdpFunnelsService } from './ddpFunnel.service';
import { DdpFunnel } from './ddpFunnel.entity';
import { SalesModule } from 'modules/sales/sales.module';
import { LeadsModule } from 'modules/leads/leads.module';
import { DealersModule } from 'modules/dealers/dealers.module';
import { UsersModule } from 'modules/users/users.module';
import { SearchModule } from 'modules/elasticsearch/elasticsearch.module';
import { InstancesModule } from 'modules/instances/instances.module';
import { DdpFunnelsController } from './ddpFunnel.controller';
import { T1FunnelsController } from './t1Funnel.controller';
import { Event } from '../events/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Funnel]),
    TypeOrmModule.forFeature([T1Funnel]),
    TypeOrmModule.forFeature([DdpFunnel]),
    TypeOrmModule.forFeature([Event]),
    InstancesModule,
    UtilitiesModule,
    forwardRef(() => UploadsModule),
    forwardRef(() => SalesModule),
    forwardRef(() => LeadsModule),
    forwardRef(() => DealersModule),
    forwardRef(() => SearchModule),
    UsersModule,
  ],
  controllers: [
    FunnelsController,
    DdpFunnelsController,
    T1FunnelsController,
    FunnelsPublicController,
  ],
  providers: [FunnelsService, T1FunnelsService, DdpFunnelsService],
  exports: [FunnelsService],
})
export class FunnelsModule {}

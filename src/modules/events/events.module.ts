import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { InstancesModule } from 'modules/instances/instances.module';
import { SearchModule } from 'modules/elasticsearch/elasticsearch.module';
import { FunnelsModule } from 'modules/funnels/funnels.module';
import { UploadsModule } from 'modules/uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    InstancesModule,
    forwardRef(() => SearchModule),
    forwardRef(() => FunnelsModule),
    UploadsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

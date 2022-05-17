import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ScheduleService } from './schedule/schedule.service';
import { UploadsModule } from 'modules/uploads/uploads.module';
import { LeadsModule } from 'modules/leads/leads.module';
import { SalesModule } from 'modules/sales/sales.module';
import { NotContactedLeadsModule } from '../notContactedLeads/notContactedLeads.module';
import { FunnelsModule } from 'modules/funnels/funnels.module';
import { IntegrationsModule } from 'modules/integrations/integrations.module';
import { LiveStoreModule } from 'modules/liveStore/liveStore.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    forwardRef(() => LeadsModule),
    forwardRef(() => UploadsModule),
    forwardRef(() => NotContactedLeadsModule),
    forwardRef(() => LiveStoreModule),
    SalesModule,
    FunnelsModule,
    IntegrationsModule,
    UsersModule,
  ],
  exports: [TasksService],
  controllers: [TasksController],
  providers: [TasksService, ScheduleService],
})
export class TasksModule {}

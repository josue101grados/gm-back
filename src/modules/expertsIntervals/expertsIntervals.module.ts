import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'modules/users/users.module';
import { ExpertsIntervalsController } from './expertsIntervals.controller';
import { ExpertsIntervalsService } from './expertsIntervals.service';
import { ExpertsInterval } from './expertsInterval.entity';
import { SearchModule } from 'modules/elasticsearch/elasticsearch.module';
import { EventsModule } from 'modules/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpertsInterval]),
    UsersModule,
    SearchModule,
    EventsModule,
  ],
  controllers: [ExpertsIntervalsController],
  providers: [ExpertsIntervalsService],
  exports: [ExpertsIntervalsService],
})
export class ExpertIntervalsModule {}

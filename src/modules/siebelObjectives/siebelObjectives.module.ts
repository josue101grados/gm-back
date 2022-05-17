import { Module } from '@nestjs/common';
import { SiebelObjective } from './siebelObjective.entity';
import { SiebelObjectivesService } from './siebelObjectives.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiebelObjectivesController } from './siebelObjectives.controller';

@Module({
  providers: [SiebelObjectivesService],
  imports: [TypeOrmModule.forFeature([SiebelObjective])],
  controllers: [SiebelObjectivesController],
  exports: [SiebelObjectivesService],
})
export class SiebelObjectivesModule {}

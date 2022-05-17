import { Module, forwardRef } from '@nestjs/common';
import { Visit } from './visit.entity';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsModule } from 'modules/uploads/uploads.module';

@Module({
  imports: [TypeOrmModule.forFeature([Visit]), forwardRef(() => UploadsModule)],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}

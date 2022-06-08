import { Module, forwardRef } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { ValidationsService } from './validations.service';
import { TasksModule } from 'modules/tasks/tasks.module';
import { UsersModule } from 'modules/users/users.module';
import { CampaignsModule } from 'modules/campaigns/campaigns.module';

@Module({
  imports: [forwardRef(() => TasksModule), UsersModule, CampaignsModule],
  controllers: [UploadsController],
  providers: [UploadsService, ValidationsService],
  exports: [UploadsService],
})
export class UploadsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { NotContactedLeadsService } from './notContactedLeads.service';
import { NotContactedLeads } from './notContactedLeads.entity';
import { NotContactedLeadsAttachments } from './attachments/attachments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotContactedLeadsController } from './notContactedLeads.controller';
import { NotContactedLeadsAttachmentsService } from './attachments/attachments.service';
import { NotContactedLeadsAttachmentController } from './attachments/attachments.controller';
import { TasksModule } from 'modules/tasks/tasks.module';
import { LeadsModule } from 'modules/leads/leads.module';
import { RolesModule } from '../roles/roles.module';
import { UploadsModule } from '../uploads/uploads.module';
import { DealersModule } from '../dealers/dealers.module';
import { Lead } from '../leads/lead.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotContactedLeads]),
    TypeOrmModule.forFeature([NotContactedLeadsAttachments]),
    TypeOrmModule.forFeature([Lead]),
    forwardRef(() => TasksModule),
    forwardRef(() => UploadsModule),
    forwardRef(() => DealersModule),
    LeadsModule,
    RolesModule,
  ],
  exports: [NotContactedLeadsService, NotContactedLeadsAttachmentsService],
  controllers: [
    NotContactedLeadsController,
    NotContactedLeadsAttachmentController,
  ],
  providers: [NotContactedLeadsService, NotContactedLeadsAttachmentsService],
})
export class NotContactedLeadsModule {}

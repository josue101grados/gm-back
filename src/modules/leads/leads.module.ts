import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsService } from './leads.service';
import { CampaignsModule } from 'modules/campaigns/campaigns.module';
import { CitiesModule } from 'modules/cities/cities.module';
import { DealersModule } from 'modules/dealers/dealers.module';
import { EmailsModule } from 'modules/emails/emails.module';
import { EstimatedPurchaseDateAliasesModule } from 'modules/estimatedPurchaseDateAliases/estimatedPurchaseDateAliases.module';
import { ModelsModule } from 'modules/models/models.module';
import { UploadsModule } from 'modules/uploads/uploads.module';
import { UtilitiesModule } from 'modules/utilities/utilities.module';
import { Lead } from './lead.entity';
import { LeadsController } from './leads.controller';
import { SearchModule } from 'modules/elasticsearch/elasticsearch.module';
import { SourcedLead } from './sourcedLead.entity';
import { SourcedLeadsService } from './sourcedLeads.service';
import { FunnelsModule } from 'modules/funnels/funnels.module';
import { UsersModule } from 'modules/users/users.module';
import { ExceptionsModule } from '../exceptions/exceptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, SourcedLead]),
    CampaignsModule,
    CitiesModule,
    forwardRef(() => DealersModule),
    EmailsModule,
    EstimatedPurchaseDateAliasesModule,
    forwardRef(() => FunnelsModule),
    forwardRef(() => ModelsModule),
    SearchModule,
    forwardRef(() => UploadsModule),
    UtilitiesModule,
    UsersModule,
    ExceptionsModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService, SourcedLeadsService],
  exports: [LeadsService, SourcedLeadsService],
})
export class LeadsModule {}

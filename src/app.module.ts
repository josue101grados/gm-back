import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConsoleModule } from 'nestjs-console';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { CitiesModule } from './modules/cities/cities.module';
import { DealersModule } from './modules/dealers/dealers.module';
import { SegmentsModule } from './modules/segments/segments.module';
import { InvalidPhonesModule } from './modules/invalidPhones/invalidPhones.module';
import { InxaitRecoveryEmailsModule } from './modules/inxaitRecoveryEmails/inxaitRecoveryEmails.module';
import { ModelsModule } from './modules/models/models.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { LeadsModule } from './modules/leads/leads.module';
import { EstimatedPurchaseDateAliasesModule } from './modules/estimatedPurchaseDateAliases/estimatedPurchaseDateAliases.module';
import { SalesModule } from './modules/sales/sales.module';
import { NotContactedLeadsModule } from './modules/notContactedLeads/notContactedLeads.module';
import { SiebelObjectivesModule } from './modules/siebelObjectives/siebelObjectives.module';
import { ZonesModule } from './modules/zones/zones.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './modules/reports/reports.module';
import { UtilitiesModule } from './modules/utilities/utilities.module';
import { EmailsModule } from './modules/emails/emails.module';
import { VisitsModule } from 'modules/visits/visits.module';
import { MailgunEventsModule } from 'modules/mailgunEvents/maligunEvents.module';
import { FunnelsModule } from './modules/funnels/funnels.module';
// import { SearchModule } from './modules/elasticsearch/elasticsearch.module';
import { CommandsModule } from './modules/commands/commands.module';
import { EventsModule } from './modules/events/events.module';
import { InstancesModule } from './modules/instances/instances.module';
import { ExpertIntervalsModule } from './modules/expertsIntervals/expertsIntervals.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ExceptionsModule } from './modules/exceptions/exceptions.module';
import { LiveStoreModule } from './modules/liveStore/liveStore.module';
import { AdvisersModule } from './modules/liveStore/advisers/advisers.module';
import { NewLeadModule } from './modules/liveStore/temporalLeads/temporalLeads.module';
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3000),
        INSTANCE_NUMBER: Joi.number().required(),
        API_SECRET: Joi.string(),
        JWT_EXPIRATION: Joi.number().default(86400),
        REFRESH_EXPIRATION: Joi.string().default('31d'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string().empty(''),
        DB_DATABASE: Joi.string().required(),
        MAIL_HOST: Joi.string().empty(''),
        MAIL_PORT: Joi.number().empty(''),
        MAIL_USERNAME: Joi.string().empty(''),
        MAIL_PASSWORD: Joi.string().empty(''),
        MAIL_FROM: Joi.string().empty(''),
        MAILGUN_WEBHOOK_SIGNING_KEY: Joi.string().required(),
        GOOGLE_STORAGE_BUCKET: Joi.string().empty(''),
        GOOGLE_APPLICATION_CREDENTIALS: Joi.string().empty(''),
        QUICK_EMAIL_VERIFICATION_KEY: Joi.string().empty(''),
        SENTRY_DSN: Joi.string().empty(''),
        // ELASTICSEARCH_HOST: Joi.string().default('localhost'),
        // ELASTICSEARCH_PORT: Joi.number().default(9200),
        // ELASTICSEARCH_PROTOCOL: Joi.string().default('http'),
        // ELASTICSEARCH_USER: Joi.string().default('elastic'),
        // ELASTICSEARCH_PWD: Joi.string().default('changeme'),
        AIVO_EMAIL: Joi.string().empty(''),
        AIVO_PASSWORD: Joi.string().empty(''),
        AIVO_X_TOKEN: Joi.string().empty(''),
        GM_INSTANCE_SLUG: Joi.string()
          .valid('ec', 'co', 'pe', 'cl', 'uy', 'py')
          .default('ec'),
        GM_INSTANCE_NAME: Joi.string().default('Ecuador'),
        GM_INSTANCE_URL: Joi.string().required(),
        GM_IMPORT_FACEBOOK_LEADS: Joi.boolean().default(false),
        GM_FACEBOOK_APP_ID: Joi.string().empty(''),
        GM_FACEBOOK_APP_SECRET: Joi.string().empty(''),
        GM_VALIDATE_EMAILS: Joi.boolean().default(false),
        GM_SEND_EMAILS: Joi.boolean().default(false),
        GM_NOTIFICATIONS_MAIL_TO: Joi.string().default('contacto@smartfie.com'),
        GM_IMPORT_AIVO_DATA: Joi.boolean().default(false),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql' as 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: false,
        logging: false,
        timezone: '-05:00',
      }),
      inject: [ConfigService],
    }),
    ConsoleModule,
    CampaignsModule,
    UsersModule,
    RolesModule,
    AuthModule,
    CitiesModule,
    DealersModule,
    InvalidPhonesModule,
    InxaitRecoveryEmailsModule,
    ModelsModule,
    AnnouncementsModule,
    LeadsModule,
    EstimatedPurchaseDateAliasesModule,
    SalesModule,
    NotContactedLeadsModule,
    SegmentsModule,
    SiebelObjectivesModule,
    ZonesModule,
    UploadsModule,
    TasksModule,
    ScheduleModule.forRoot(),
    ReportsModule,
    UtilitiesModule,
    EmailsModule,
    VisitsModule,
    MailgunEventsModule,
    FunnelsModule,
    // SearchModule,
    CommandsModule,
    EventsModule,
    InstancesModule,
    ExpertIntervalsModule,
    IntegrationsModule,
    ExceptionsModule,
    LiveStoreModule,
    AdvisersModule,
    NewLeadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

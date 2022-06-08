import * as path from 'path';
import { Module } from '@nestjs/common';
import { PugAdapter, MailerModule } from '@nestjs-modules/mailer';
import { EmailsService } from './emails.service';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<string>('MAIL_PORT'),
          ignoreTLS: false,
          secure: true,
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          auth: {
            user: configService.get<string>('MAIL_USERNAME'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"GMInfoleads" <${configService.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: path.join(__dirname, '../../../templates'),
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}

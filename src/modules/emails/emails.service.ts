import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { toUpper } from 'lodash';
import moment = require('moment');
import { LeadsImportEmailDto } from './dto/leads-import.dto';
import { FirstContactEmailDto } from './dto/first-contact.dto';
import * as crypto from 'crypto';
import { Funnel, LeadTypes } from 'modules/funnels/funnel.entity';
import { isValid } from 'date-fns';
import { EmailTypes } from 'modules/models/model.entity';

@Injectable()
export class EmailsService {
  private environment;
  private instanceSlug;
  private instanceName;
  private sendEmails;
  private instanceUrl;

  constructor(
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    this.environment = this.configService.get('NODE_ENV');
    this.instanceSlug = this.configService.get('GM_INSTANCE_SLUG');
    this.instanceName = this.configService.get('GM_INSTANCE_NAME');
    this.sendEmails = this.configService.get('GM_SEND_EMAILS');
    this.instanceUrl = this.configService.get('GM_INSTANCE_URL');
  }

  /**
   * Sends Import Leads Email
   * @param emailOptions Email Options
   */
  async sendImportLeadsEmail(
    emailOptions: LeadsImportEmailDto,
  ): Promise<boolean> {
    let subject = `Carga Leads ${emailOptions.context.type} - ${toUpper(
      this.instanceSlug,
    )}`;
    let message = `No se encontraron errores en la carga de leads de ${emailOptions.context.type}`;
    const today = moment();

    if (emailOptions.context.sendErrorsEmail) {
      subject = `Errores Leads ${emailOptions.context.type} - ${toUpper(
        this.instanceSlug,
      )}`;
      message = `Existieron errores al importar leads de ${emailOptions.context.type}. Adjunto se encuentra el archivo de errores.`;
    }

    emailOptions.context.message = message;
    subject = `[GMInfoleads]  - ${today.format('YYYY-MM-DD HH:mm')}`;

    if (this.environment === 'development') {
      subject = `[PRUEBA] ${subject}`;
    }

    await this.mailerService.sendMail({
      ...emailOptions,
      subject,
      template: 'leads-import',
    });
    return true;
  }

  /**
   * Sends First Contact Email
   * @param emailOptions Email Options
   */
  async sendFirstContactEmail(emailOptions: FirstContactEmailDto) {
    const { lead } = emailOptions.context;
    let name = '';
    let tag = 'PRIMER CONTACTO';
    let template = `first-contact-${this.instanceSlug}`;
    if (
      lead.model.emailType === EmailTypes.LIVE_STORE &&
      // if campaign is GMCO_GMF_Aprobados sin desembolsar and the email type is livestore, send first contact email
      lead.campaign.name !== 'GMCO_GMF_Aprobados sin desembolsar'
    ) {
      tag = 'LIVE STORE';
      template = `live-store-${this.instanceSlug}`;
    }
    emailOptions.context.host = this.instanceUrl;

    // encrypt funnel id
    if (emailOptions.context.funnel) {
      emailOptions.context.crypted = await this.encrypt(
        `${emailOptions.context.funnel.id}`,
      );
    }
    if (lead.nameIsValid) {
      name = lead.name1;
    } else {
      name = lead.names ? lead.names.split(' ')[0] : lead.names;
    }
    emailOptions.context.name = name;

    if (this.sendEmails && lead.emailIsValid) {
      if (lead.model && lead.dealerDealership) {
        tag += '|PERSONALIZADO';
      } else {
        template = 'first-contact-generic';
        tag += '|GENERICO';
      }

      const headers = {
        'X-Mailgun-Tag': tag,
      };

      let subject = '🚗 Estás un paso más cerca de tu nuevo auto';
      if (name !== '') {
        subject = `🚗 ${name}, estás un paso más cerca de tu nuevo auto`;
      }
      emailOptions.from = {
        name: `Chevrolet ${this.instanceName}`,
        address: 'chevrolet@gminfoleads.com',
      };

      if (this.environment === 'development') {
        subject = `[PRUEBA] ${subject}`;
        emailOptions.to = this.configService.get('GM_NOTIFICATIONS_MAIL_TO');
      }
      console.log('sendemail');
      await this.mailerService.sendMail({
        ...emailOptions,
        headers,
        subject,
        template,
      });
      return true;
    }
    return false;
  }

  async encrypt(text: string) {
    const algorithm = 'aes-256-cbc';
    // Defining key
    const key = 'cmiaernkteotuinnggrraedloascison';
    // Defininf iv
    const iv = 'semiafrteiftrams';
    // Creating cipher
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    // Updating text
    let encrypted = cipher.update(text);
    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const encryptedData = encrypted.toString('hex');
    console.log(encryptedData);
    return encryptedData;
  }
}

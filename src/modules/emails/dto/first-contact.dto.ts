import { SendEmailDto } from './send-email.dto';
import { Lead } from 'modules/leads/lead.entity';
import { SourcedLead } from 'modules/leads/sourcedLead.entity';
import { Funnel } from 'modules/funnels/funnel.entity';

export interface FirstContactEmailDto extends SendEmailDto {
  readonly context: {
    readonly lead: Lead | SourcedLead;
    name?: string | null;
    readonly funnel?: Funnel | null;
    crypted?: string | null;
    host?: string | null;
  };
}

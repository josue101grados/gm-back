import { LeadSources } from 'modules/leads/sourcedLead.entity';
export class UploadSourcesDto {
  source:
    | LeadSources.FACEBOOK
    | LeadSources.DDP_FACEBOOK
    | LeadSources.CALL_CENTER
    | LeadSources.RRSS
    | LeadSources.GENERIC;
  campaign: string;
}

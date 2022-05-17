import {
  Client,
  // Object that contains the type definitions of every API method
  RequestParams,
  // Interface of the generic API response
  ApiResponse,
} from '@elastic/elasticsearch';

export interface FunnelLead {
  id: number;
  instance: string;
  opportunityName: string;
  campaign: string;
  model: string;
  family: string;
  dealerDealership: string;
  dealerGroup: string;
  document: string;
  date: Date;
  creationDate: Date;
  status: string;
  isValid: boolean;
  email: string;
  source: string;
  names: string;
  lastNames: string;
  name1: string;
  name2: string;
  lastName1: string;
  lastName2: string;
  phone: string;
  workPhone: string;
  mobile: string;
  city: string;
  vin: string;
  createdAt: Date;
  funnelId: number;
  sourcedLeadId: number;
  clickOnWhatsapp: boolean;
  clickOnWhatsappDate: Date;
  clickOnCallUs: boolean;
  clickOnCallUsDate: Date;
  clickOnFindUs: boolean;
  clickOnFindUsDate: Date;
  emailType: string;
  inxaitDownloadAt: Date;
  smsSent: boolean;
  emailSent: boolean;
  sendDate: Date;
  openDate: Date;
  clickDate: Date;
  bouncedDate: Date;
  eventId: number;
}
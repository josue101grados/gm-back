export interface Address {
  name: string;
  address: string;
}
export class SendEmailDto {
  to: string;

  bcc?: string;

  from?: string | Address;
}

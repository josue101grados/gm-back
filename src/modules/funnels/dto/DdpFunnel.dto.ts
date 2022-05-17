import { IsNumber, Min, ValidateNested } from 'class-validator';
import { PaymentTypes, CreditProviders } from '../common/payments';
import { Type } from 'class-transformer';

export class DdpFunnelDto {
  @IsNumber()
  @Min(0)
  contacts: number;

  @IsNumber()
  @Min(0)
  interested: number;

  @IsNumber()
  @Min(0)
  quoteAsked: number;

  @ValidateNested()
  @Type(type => CreditProviders)
  creditRequests: Pick<CreditProviders, 'total'>;

  @ValidateNested()
  @Type(type => CreditProviders)
  creditApprovals: Pick<CreditProviders, 'total'>;

  @ValidateNested()
  @Type(type => CreditProviders)
  creditRejections: Pick<CreditProviders, 'total'>;

  @IsNumber()
  @Min(0)
  interestedOnCashPayment: number;

  @IsNumber()
  @Min(0)
  diffrentIdSales: number;

  @IsNumber()
  @Min(0)
  paymentPostponed: number;

  @ValidateNested()
  @Type(type => PaymentTypes)
  reservations: PaymentTypes;

  @ValidateNested()
  @Type(type => PaymentTypes)
  billed: PaymentTypes;
}

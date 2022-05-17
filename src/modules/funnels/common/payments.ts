import { Min, IsNumber } from 'class-validator';

export class CreditProviders {
  @IsNumber()
  @Min(0)
  produbanco: number;
  @IsNumber()
  @Min(0)
  guayaquil: number;
  @IsNumber()
  @Min(0)
  chevyplan: number;
  @IsNumber()
  @Min(0)
  cooperativas: number;
  @IsNumber()
  @Min(0)
  others: number;
  @IsNumber()
  @Min(0)
  total: number;
}

// tslint:disable-next-line: max-classes-per-file
export class PaymentTypes {
  @IsNumber()
  @Min(0)
  credit: number;
  @IsNumber()
  @Min(0)
  cash: number;
}
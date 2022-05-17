import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsString,
  IsOptional,
  Length,
} from 'class-validator';

export class UpdateScheduledEventData {
  @IsNumber()
  id: number; // Event ID

  @IsString()
  @Length(2, 2)
  instance: string;

  @IsObject()
  model: { id: number; model: string };

  @IsNumber()
  userId: number;

  @IsString()
  userFullName: string;

  @IsString()
  startDate: string | Date;

  @IsString()
  endDate: string | Date;

  @IsString()
  @IsOptional()
  requestedDate?: string;

  @IsBoolean()
  @IsOptional()
  requiresFinancing?: boolean;

  @IsBoolean()
  @IsOptional()
  quoteAsked?: boolean;

  @IsBoolean()
  @IsOptional()
  creditRequested?: boolean;

  @IsBoolean()
  @IsOptional()
  creditApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  purchasePostponed?: boolean;

  @IsBoolean()
  @IsOptional()
  reservation?: boolean;

  @IsBoolean()
  @IsOptional()
  differentIdSale?: boolean;

  @IsBoolean()
  @IsOptional()
  billed?: boolean;

  @IsBoolean()
  @IsOptional()
  firstVehicle?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAnotherChevrolet?: boolean;

  @IsBoolean()
  @IsOptional()
  otherBrandConsidering?: boolean;

  @IsBoolean()
  @IsOptional()
  appointmentFulfilled?: boolean;

  @IsBoolean()
  @IsOptional()
  derived?: boolean;

  @IsNumber()
  @IsOptional()
  moneyToBuy?: number;

  @IsString()
  @IsOptional()
  notInterestedReason: any;
}

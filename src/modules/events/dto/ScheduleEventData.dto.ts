import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsString,
  IsOptional,
  Length,
} from 'class-validator';
import { EventType } from '../event.entity';

export class ScheduleEventData {
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
  type: EventType;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  requestedDate: string;

  @IsObject()
  funnel: { id: number };

  @IsBoolean()
  @IsOptional()
  requiresFinancing?: boolean;

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
}

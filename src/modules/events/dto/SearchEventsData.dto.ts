import { IsNumberString, IsString, IsOptional } from 'class-validator';
import { EventType, EventStatus } from '../event.entity';

export class SearchEventsData {
  @IsString()
  @IsOptional()
  from?: Date | string = null;

  @IsString()
  @IsOptional()
  to?: Date | string = null;

  @IsNumberString()
  @IsOptional()
  expert?: number = null;

  @IsNumberString()
  @IsOptional()
  dealerGroup?: number = null;

  @IsString()
  @IsOptional()
  model?: string = null;

  @IsString()
  @IsOptional()
  date?: Date | string = null;

  @IsNumberString()
  @IsOptional()
  funnelId?: number = null;

  @IsString()
  @IsOptional()
  instance?: string = null;

  @IsString()
  @IsOptional()
  type?: EventType = null;

  @IsString()
  @IsOptional()
  status?: EventStatus = null;

  @IsString()
  @IsOptional()
  documentOrPhone?: string = null;

  @IsNumberString()
  @IsOptional()
  derived?: number = null;
}

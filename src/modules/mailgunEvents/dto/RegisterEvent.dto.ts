import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class Signature {
  @IsString()
  public timestamp: string;

  @IsString()
  public token: string;

  @IsString()
  public signature: string;
}

class EventData {
  @IsString()
  public recipient: string;

  @IsString()
  public event: string;
}

export class RegisterEventDto {
  @ApiProperty()
  @ValidateNested()
  @IsObject()
  @Type(() => Signature)
  signature: Signature;

  @ApiProperty()
  @ValidateNested()
  @IsObject()
  @Type(() => EventData)
  'event-data': EventData;
}

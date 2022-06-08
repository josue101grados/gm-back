import { IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateTemporalLeadDto {
  @IsString()
  @ApiProperty()
  opportunityName: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  document?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  names: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  lastNames?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  modelName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  campaignName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  mobile?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  dealerDealershipName?: string;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  dealerDealershipId?: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  bac?: string;
}

export class UpdateTemporalLeadDto extends PartialType(CreateTemporalLeadDto) {}

import {
  IsPositive,
  IsEnum,
  Min,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateResultLeadsSalesDto {
  @ValidateIf(data => !data.are360results)
  @IsBoolean()
  @ApiProperty()
  readonly are120results?: boolean;

  @ValidateIf(data => !data.are120results)
  @IsBoolean()
  @ApiProperty()
  readonly are360results?: boolean;

  @Min(1)
  @Max(12)
  @ApiProperty()
  readonly leadMonth: number;

  @Min(2019)
  @ApiProperty()
  readonly leadYear: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly january?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly february?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly march?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly april?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly may?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly june?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly july?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly august?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly september?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly october?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly november?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly december?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly validLeads?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly totalSales?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly closingRate?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly dealerGroupId?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly dealerCityId?: number;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  readonly dealerDealershipId?: number;
}

export class UpdateResultLeadsSalesDto extends PartialType(
  CreateResultLeadsSalesDto,
) {}

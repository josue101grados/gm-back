import {
  IsPositive,
  IsEnum,
  Min,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  Max,
  IsDate,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateSaleAssignationDto {
  @IsBoolean()
  @ApiProperty()
  readonly isActive: boolean;

  @IsString()
  @ApiProperty()
  readonly fromLeadsDate: Date;

  @IsString()
  @ApiProperty()
  readonly toLeadsDate: Date;

  @IsBoolean()
  @ApiProperty()
  readonly take120FranchiseSales: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly take120OverallSales?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly take360FranchiseSales?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly take360OverallSales?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly takeXTimeFranchiseSales?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly takeXTimeOverallSales?: boolean;
}

export class UpdateSaleAssignationDto extends PartialType(
  CreateSaleAssignationDto,
) {}

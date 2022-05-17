import {
  IsString,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';

export class CreateExceptionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty() // I add this decorator because of when I made an Update, this field was not required
  readonly opportunityName: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly campaignName?: string;

  @IsDate()
  @ApiProperty()
  readonly derivationDate: Date;

  @IsDate()
  @ApiProperty()
  readonly siebelDate: Date;

  @IsString()
  @ApiProperty()
  readonly estimatedPurchaseDate: string;

  @IsString()
  @ApiProperty()
  readonly normalizedEstimatedPurchaseDate: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly isFiltered?: boolean;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  readonly modelId: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly isValid?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly document?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly names?: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly lastNames?: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly mobile?: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly phone?: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly workPhone?: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly email?: string;
}

export class UpdateExceptionDto extends PartialType(CreateExceptionDto) {}

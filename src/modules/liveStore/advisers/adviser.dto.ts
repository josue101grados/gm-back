import { IsPositive, IsString, IsAlpha, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateAdviserDto {
  @IsString()
  @IsAlpha()
  @ApiProperty()
  readonly name: string;

  @IsString()
  @IsAlpha()
  @ApiProperty()
  readonly lastName: string;

  @IsPositive()
  @ApiProperty()
  readonly dealerGroupId: number;
}

export class UpdateAdviserDto extends PartialType(CreateAdviserDto) {}

export class FilterAdvisersDto {
  @IsOptional()
  @IsPositive()
  readonly dealerGroupId?: number;
}

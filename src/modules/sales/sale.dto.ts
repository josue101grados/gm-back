import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class ReprocessSalesByMonth {
  @Min(1)
  @Max(12)
  @IsNumber()
  @ApiProperty()
  readonly month: number;

  @Min(2019)
  @Max(2030)
  @ApiProperty()
  readonly year: number;
}

export class ReprocessSalesByYear {
  @Min(2019)
  @Max(2030)
  @ApiProperty()
  readonly year: number;
}

import { IsArray } from 'class-validator';

export class UpdateFunnelRows {
  @IsArray()
  rows: string[][];
}

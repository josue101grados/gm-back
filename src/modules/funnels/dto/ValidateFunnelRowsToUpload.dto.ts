import { IsArray } from 'class-validator';

export class ValidateFunnelRowsToUpload {
  @IsArray()
  rows: string[][];
}

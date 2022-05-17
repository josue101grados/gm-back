import { IsArray } from 'class-validator';

export class MarkFunnelAsDownloaded {
  @IsArray()
  funnelIds: number[];
}

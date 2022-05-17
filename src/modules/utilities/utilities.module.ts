import { Module } from '@nestjs/common';
import { UtilitiesService } from './utilities.service';
import { InvalidPhonesModule } from 'modules/invalidPhones/invalidPhones.module';

@Module({
  imports: [InvalidPhonesModule],
  providers: [UtilitiesService],
  exports: [UtilitiesService],
})
export class UtilitiesModule {}

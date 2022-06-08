import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvalidPhone } from './invalidPhone.entity';
import { InvalidPhonesController } from './invalidPhones.controller';
import { InvalidPhonesService } from './invalidPhones.service';

@Module({
  imports: [TypeOrmModule.forFeature([InvalidPhone])],
  controllers: [InvalidPhonesController],
  providers: [InvalidPhonesService],
  exports: [InvalidPhonesService],
})
export class InvalidPhonesModule {}

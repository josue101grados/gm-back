import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Adviser } from './adviser.entity';
import { AdvisersController } from './advisers.controller';
import { AdvisersService } from './advisers.service';
import { DealersModule } from '../../dealers/dealers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Adviser]),
    forwardRef(() => DealersModule),
  ],
  controllers: [AdvisersController],
  providers: [AdvisersService],
  exports: [AdvisersService],
})
export class AdvisersModule {}

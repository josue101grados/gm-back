import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instance } from './instance.entity';
import { InstancesService } from './instances.service';

@Module({
  imports: [TypeOrmModule.forFeature([Instance]), HttpModule],
  providers: [InstancesService],
  exports: [InstancesService],
})
export class InstancesModule {}

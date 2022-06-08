import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model } from './model.entity';
import { ModelAlias } from './modelAlias.entity';
import { ModelsController } from './models.controller';
import { ModelAliasesService } from './modelAliases.service';
import { ModelsService } from './models.service';
import { UploadsModule } from 'modules/uploads/uploads.module';
import { ModelAliasesController } from './modelAliases.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Model]),
    TypeOrmModule.forFeature([ModelAlias]),
    forwardRef(() => UploadsModule),
  ],
  controllers: [ModelsController, ModelAliasesController],
  providers: [ModelsService, ModelAliasesService],
  exports: [ModelsService],
})
export class ModelsModule {}

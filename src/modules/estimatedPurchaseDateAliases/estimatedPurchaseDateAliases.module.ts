import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimatedPurchaseDateAlias } from './estimatedPurchaseDateAlias.entity';
import { EstimatedPurchaseDateAliasesController } from './estimatedPurchaseDateAliases.controller';
import { EstimatedPurchaseDateAliasesService } from './estimatedPurchaseDateAliases.service';

@Module({
  imports: [TypeOrmModule.forFeature([EstimatedPurchaseDateAlias])],
  controllers: [EstimatedPurchaseDateAliasesController],
  providers: [EstimatedPurchaseDateAliasesService],
  exports: [EstimatedPurchaseDateAliasesService],
})
export class EstimatedPurchaseDateAliasesModule {}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { EstimatedPurchaseDateAlias } from './estimatedPurchaseDateAlias.entity';
import { EstimatedPurchaseDateAliasesService } from './estimatedPurchaseDateAliases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: EstimatedPurchaseDateAlias,
  },
})
@Controller('estimatedPurchaseDateAliases')
@UseGuards(JwtAuthGuard)
export class EstimatedPurchaseDateAliasesController
  implements CrudController<EstimatedPurchaseDateAlias> {
  constructor(public service: EstimatedPurchaseDateAliasesService) {}
}

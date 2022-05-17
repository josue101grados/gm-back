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
import { InvalidPhone } from './invalidPhone.entity';
import { InvalidPhonesService } from './invalidPhones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: InvalidPhone,
  },
})
@Controller('invalidPhones')
@UseGuards(JwtAuthGuard)
export class InvalidPhonesController implements CrudController<InvalidPhone> {
  constructor(public service: InvalidPhonesService) {}
}

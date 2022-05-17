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
import { Zone } from './zone.entity';
import { ZonesService } from './zones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: Zone,
  },
})
@Controller('zones')
@UseGuards(JwtAuthGuard)
export class ZonesController implements CrudController<Zone> {
  constructor(public service: ZonesService) {}
}

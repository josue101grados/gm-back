import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Segment } from './segment.entity';
import { SegmentsService } from './segments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: Segment,
  },
})
@Controller('segments')
@UseGuards(JwtAuthGuard)
export class SegmentsController implements CrudController<Segment> {
  constructor(public service: SegmentsService) {}
}

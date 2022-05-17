import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Param,
  Query,
} from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Event } from './event.entity';
import { EventsService } from './events.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { ScheduleEventData } from './dto/ScheduleEventData.dto';
import { InstanceGuard } from 'modules/auth/guards/instance.guard';
import { UpdateScheduledEventData } from './dto/UpdateScheduledEventData.dto';
import { SearchEventsData } from './dto/SearchEventsData.dto';

@Crud({
  model: {
    type: Event,
  },
  routes: {
    createOneBase: {
      decorators: [UseGuards(JwtAuthGuard, RolesGuard), Roles('admin')],
    },
    createManyBase: {
      decorators: [UseGuards(JwtAuthGuard, RolesGuard), Roles('admin')],
    },
    updateOneBase: {
      decorators: [UseGuards(JwtAuthGuard, RolesGuard), Roles('admin')],
    },
    replaceOneBase: {
      decorators: [UseGuards(JwtAuthGuard, RolesGuard), Roles('admin')],
    },
    deleteOneBase: {
      decorators: [UseGuards(JwtAuthGuard, RolesGuard), Roles('admin')],
    },
  },
})
@Controller('events')
@UsePipes(ValidationPipe)
export class EventsController implements CrudController<Event> {
  constructor(public service: EventsService) {}

  @Get('search')
  @Roles(
    'inxait',
    'nodo',
    'autotrain',
    'supervisor_dealer',
    'admin',
    'dealer',
    'callcenter_dealer',
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  async search(@Query() searchEventsData: SearchEventsData) {
    return await this.service.searchEvents(searchEventsData);
  }

  @Post('schedule')
  @Roles('nodo', 'admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async schedule(@Body() scheduleEventData: ScheduleEventData) {
    return await this.service.scheduleEvent(scheduleEventData);
  }

  @Post('instance/schedule')
  @UseGuards(InstanceGuard)
  async scheduleInInstance(@Body() scheduleEventData: ScheduleEventData) {
    return await this.service.scheduleEvent(scheduleEventData);
  }

  @Patch('schedule')
  @Roles(
    'inxait',
    'nodo',
    'autotrain',
    'callcenter_dealer',
    'admin',
    'dealer',
    'supervisor_dealer',
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateScheduledEvent(
    @Body() updateScheduledEventData: UpdateScheduledEventData,
  ) {
    return await this.service.updateScheduledEvent(updateScheduledEventData);
  }

  @Patch('instance/schedule')
  @UseGuards(InstanceGuard)
  async updateScheduledEventInInstance(
    @Body() updateScheduledEventData: UpdateScheduledEventData,
  ) {
    return await this.service.updateScheduledEvent(updateScheduledEventData);
  }

  @Get('download')
  @Roles('inxait', 'admin')
  async downloadActiveEvents() {
    const documentLink = await this.service.downloadActiveEvents();

    if (documentLink) {
      return {
        message: '',
        documentLink,
      };
    }

    return {
      message: 'No hay events activos para descargar',
      documentLink: null,
    };
  }
}

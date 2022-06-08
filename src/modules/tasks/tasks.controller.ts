import {
  Controller,
  UseGuards,
  Post,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Body,
  Req,
} from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Task, TaskStatus } from './task.entity';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { RolesGuard } from 'modules/auth/guards/roles.guard';

@Crud({
  model: {
    type: Task,
  },
  routes: {
    getManyBase: {
      decorators: [Roles('admin', 'callcenter')],
    },
    getOneBase: {
      decorators: [Roles('admin')],
    },
    createOneBase: {
      decorators: [Roles('admin')],
    },
    createManyBase: {
      decorators: [Roles('admin')],
    },
    updateOneBase: {
      decorators: [Roles('admin')],
    },
    replaceOneBase: {
      decorators: [Roles('admin')],
    },
    deleteOneBase: {
      decorators: [Roles('admin')],
    },
  },
})
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController implements CrudController<Task> {
  constructor(public service: TasksService) {}

  @Post(':id/mark-as-pending')
  @Roles('dealer', 'admin', 'gm')
  async markAsPending(@Param('id') id: string) {
    const task = await this.service.getTaskById(id);
    if (!task || task.status !== TaskStatus.IN_PROGESS) {
      throw new HttpException(
        'Task not found or not in progress',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.service.setTaksAsPending(task);
  }
  @Get('/dealer-live-store')
  @Roles('dealer', 'admin', 'gm')
  async getLiveStoreTasks(@Req() req) {
    const { userId } = req.user;

    return await this.service.getLiveStoreTasks(userId);
  }
}

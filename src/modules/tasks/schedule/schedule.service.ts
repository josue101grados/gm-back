import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TasksService } from 'modules/tasks/tasks.service';
import { TaskStatus } from 'modules/tasks/task.entity';
import { SourcedLeadsService } from 'modules/leads/sourcedLeads.service';
import { ConfigService } from '@nestjs/config';
import { AivoService } from 'modules/integrations/aivo/aivo.service';
import { SalesService } from 'modules/sales/sales.service';
import { LeadsService } from 'modules/leads/leads.service';
@Injectable()
export class ScheduleService {
  private environment;
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private configService: ConfigService,
    private readonly tasksService: TasksService,
    private readonly sourcedLeadsService: SourcedLeadsService,
    private readonly aivoService: AivoService,
    private salesService: SalesService,
    private leadsService: LeadsService,
  ) {
    this.environment = this.configService.get('NODE_ENV');
  }

  @Cron('* * * * *')
  async executeTask() {
    this.logger.log(`Verifying executing tasks in [${this.environment}]...`);
    const inProgressTask = await this.tasksService.findOne({
      where: {
        status: TaskStatus.IN_PROGESS,
        instanceNumber: this.configService.get('INSTANCE_NUMBER'),
      },
    });
    if (inProgressTask) {
      this.logger.warn(`Task #${inProgressTask.id} is In Progress`);
    } else {
      const pendingTask = await this.tasksService.findOne({
        where: {
          status: TaskStatus.PENDING,
          instanceNumber: this.configService.get('INSTANCE_NUMBER'),
        },
        order: {
          createdAt: 'ASC',
        },
      });
      if (pendingTask) {
        await this.tasksService.setTaksInProgress(pendingTask);
        this.logger.verbose(
          `Executing Task #${pendingTask.id} in [${this.environment}]`,
        );
        await this.tasksService.executeTask(pendingTask);
        this.logger.verbose(
          `Finished executing Task #${pendingTask.id} in [${this.environment}]`,
        );
      } else {
        this.logger.log(`No pending tasks in [${this.environment}]...`);
      }
    }
  }

  @Cron('0 * * * *')
  async importExternalLeads() {
    this.logger.log(`Initializing Leads Import in [${this.environment}]...`);
    this.sourcedLeadsService.importFacebookLeads();
  }

  // @Cron('30 * * * *')
  // async importAivoData() {
  //   this.logger.log(`Initializing Aivo Import in [${this.environment}]...`);
  //   this.aivoService.importAivoData();
  // }
}

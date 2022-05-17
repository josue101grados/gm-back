import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ConfigService } from '@nestjs/config';
import { Task, TaskTypes, TaskStatus } from './task.entity';
import { User } from 'modules/users/user.entity';
import { UploadsService } from 'modules/uploads/uploads.service';
import { LeadsService } from 'modules/leads/leads.service';
import { SalesService } from 'modules/sales/sales.service';
import { NotContactedLeadsService } from '../notContactedLeads/notContactedLeads.service';
import { SourcedLeadsService } from 'modules/leads/sourcedLeads.service';
import { FunnelsService } from 'modules/funnels/funnels.service';
import { LiveStoreService } from '../liveStore/liveStore.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService extends TypeOrmCrudService<Task> {
  private instanceNumber: number;
  constructor(
    @InjectRepository(Task) repo,
    private uploadsService: UploadsService,
    private leadsService: LeadsService,
    private salesService: SalesService,
    private sourcedLeadsService: SourcedLeadsService,
    private funnelsService: FunnelsService,
    private configService: ConfigService,
    private usersService: UsersService,
    @Inject(forwardRef(() => NotContactedLeadsService))
    private notContactedLeadsService: NotContactedLeadsService,
    @Inject(forwardRef(() => LiveStoreService))
    private liveStoreService: LiveStoreService,
  ) {
    super(repo);
    this.instanceNumber = this.configService.get('INSTANCE_NUMBER');
  }
  async createTask(task: {
    type: TaskTypes;
    filePath: string;
    user: User;
    data?: object;
  }) {
    /*  const user = await this.usersService.findById(task.user.id); */

    await this.repo.save(
      this.repo.create({
        ...task,
        instanceNumber: this.instanceNumber,
      }),
    );
  }

  async setTaksInProgress(task) {
    await this.repo.update(task.id, { status: TaskStatus.IN_PROGESS });
  }

  async setTaksAsPending(task) {
    await this.repo.update(task.id, { status: TaskStatus.PENDING });
  }

  async getTaskById(id: string | number) {
    return await this.repo.findOne(id);
  }

  async executeTask(task: Task) {
    const fileName = task.filePath.split('/').pop();
    const fileDestination = `temp/${fileName}`;
    // download the file
    await this.uploadsService.downloadFileFromGoogle(
      task.filePath,
      fileDestination,
    );
    // tslint:disable-next-line:one-variable-per-declaration
    let errorsFilePath, errorsDestination;
    // Send it to the database depending on the task type
    switch (task.type) {
      case TaskTypes.DIRECTS_UPLOAD:
        errorsFilePath = await this.leadsService.directUploadsToDatabase(
          fileDestination,
          fileName,
        );
        errorsDestination = `uploads/direct-uploads/errors/errors-${fileName}`;
        break;
      case TaskTypes.SALES_UPLOAD:
        const { data: salesData } = task;
        if (salesData.year && salesData.month) {
          errorsFilePath = await this.salesService.salesToDatabase(
            fileDestination,
            fileName,
            Number(salesData.year),
            Number(salesData.month),
          );
        }
        errorsDestination = `uploads/sales-uploads/errors/errors-${fileName}`;
        break;
      case TaskTypes.SOURCES_UPLOAD:
        const { data: sourcesData } = task;
        errorsFilePath = await this.sourcedLeadsService.sourcesToDatabase(
          fileDestination,
          fileName,
          sourcesData.campaignId,
          sourcesData.source,
        );
        errorsDestination = `uploads/sources-uploads/errors/errors-${fileName}`;
        break;
      case TaskTypes.FUNNEL_UPLOAD:
        errorsFilePath = await this.funnelsService.funnelsToDatabaase(
          fileDestination,
          fileName,
        );
        errorsDestination = `uploads/funnels-uploads/errors/errors-${fileName}`;
        break;
      case TaskTypes.CONTACTABILITY_UPLOAD:
        const { data: contactabilityData } = task;
        if (contactabilityData.year && contactabilityData.month) {
          errorsFilePath = await this.notContactedLeadsService.notContactedLeadsToDatabase(
            fileDestination,
            fileName,
            Number(contactabilityData.year),
            Number(contactabilityData.month),
            task.id,
          );
        }
        break;
      case TaskTypes.LIVE_STORE_UPLOAD:
        const { data: liveStoreData } = task;
        if (liveStoreData.year && liveStoreData.month) {
          errorsFilePath = await this.liveStoreService.liveStoreToDatabase(
            fileDestination,
            fileName,
            Number(liveStoreData.year),
            Number(liveStoreData.month),
            task.id,
          );
        }
        break;
    }
    // delete the already processed file
    await this.uploadsService.deleteFile(fileDestination);
    if (errorsFilePath) {
      const uploadRes = await this.uploadsService.uploadAndGetPublicUrl(
        errorsFilePath,
        errorsDestination,
      );
      await this.repo.update(task.id, {
        status: TaskStatus.COMPLETED,
        errorsFilePath: uploadRes.publicURL,
      });
      await this.uploadsService.deleteFile(errorsFilePath);
    } else {
      await this.repo.update(task.id, { status: TaskStatus.COMPLETED });
    }
  }

  async getCertainNumberOfTasks(tasksNumber: number, type: string) {
    const tasks = await this.repo
      .createQueryBuilder()
      .select()
      .where(`type = '${type}'`)
      .andWhere(`errorsFilePath is NULL`)
      .orderBy(`id`, 'DESC')
      .limit(tasksNumber)
      .getRawMany();
    return tasks;
  }
  async getLiveStoreTasks(id: number) {
    return await this.repo.find({
      where: {
        type: TaskTypes.LIVE_STORE_UPLOAD,
        user: {
          id,
        },
      },
      order: {
        id: 'DESC',
      },
    });
  }
}

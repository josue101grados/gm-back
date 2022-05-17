import { Injectable, HttpService } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Instance } from './instance.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEventData } from 'modules/events/dto/ScheduleEventData.dto';
import { UpdateScheduledEventData } from 'modules/events/dto/UpdateScheduledEventData.dto';

@Injectable()
export class InstancesService extends TypeOrmCrudService<Instance> {
  constructor(
    @InjectRepository(Instance)
    private instanceRepository: Repository<Instance>,
    private httpService: HttpService,
  ) {
    super(instanceRepository);
  }

  /**
   * Mark Funnel as Downloaded on Instance
   * @param instance Instance
   * @param funnelIds Array of Funnel Ids
   */
  async markFunnelsAsDownloaded(instance: Instance, funnelIds: number[]) {
    return await this.httpService
      .post(
        `${instance.url}/funnels_public/mark_downloaded`,
        {
          funnelIds,
        },
        {
          headers: {
            authorization: instance.apiKey,
          },
        },
      )
      .toPromise();
  }

  /**
   * Validates Rows of funnels to upload in Instance
   * @param instance Instance
   * @param rows Array of Funnel Ids
   */
  async validateFunnelRowsToUpload(instance: Instance, rows) {
    const response = await this.httpService
      .post(
        `${instance.url}/funnels_public/validate_for_upload`,
        {
          rows,
        },
        {
          headers: {
            authorization: instance.apiKey,
          },
        },
      )
      .toPromise();
    return response.data;
  }

  /**
   * Updates Rows of funnels in Instance
   * @param instance Instance
   * @param rows Array of Funnels
   */
  async updateFunnelRows(instance: Instance, rows) {
    const response = await this.httpService
      .patch(
        `${instance.url}/funnels_public/update_funnels`,
        {
          rows,
        },
        {
          headers: {
            authorization: instance.apiKey,
          },
        },
      )
      .toPromise();
    return response.data;
  }

  /**
   * Schedule new Event in instance
   * @param instance Instance
   * @param scheduleEventData Event Data
   */
  async scheduleEvent(
    instance: Instance,
    scheduleEventData: ScheduleEventData,
  ) {
    const response = await this.httpService
      .post(`${instance.url}/events/instance/schedule`, scheduleEventData, {
        headers: {
          authorization: instance.apiKey,
        },
      })
      .toPromise();
    return response.data;
  }

  /**
   * Schedule new Event in instance
   * @param instance Instance
   * @param scheduleEventData Event Data
   */
  async updateScheduledEvent(
    instance: Instance,
    updateScheduledEventData: UpdateScheduledEventData,
  ) {
    const response = await this.httpService
      .patch(
        `${instance.url}/events/instance/schedule`,
        updateScheduledEventData,
        {
          headers: {
            authorization: instance.apiKey,
          },
        },
      )
      .toPromise();
    return response.data;
  }
}

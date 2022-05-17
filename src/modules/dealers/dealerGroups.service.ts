import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DealerGroup } from './dealerGroup.entity';

@Injectable()
export class DealerGroupsService extends TypeOrmCrudService<DealerGroup> {
  constructor(@InjectRepository(DealerGroup) repo) {
    super(repo);
  }

  async increaseSavesCounter(dealerId) {
    await this.repo
      .createQueryBuilder()
      .update()
      .where(`id = ${dealerId}`)
      .set({ editionCounter: () => 'editionCounter + 1' })
      .execute();
  }
}

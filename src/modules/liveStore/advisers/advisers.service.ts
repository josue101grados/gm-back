import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { Adviser } from './adviser.entity';
import {
  CreateAdviserDto,
  UpdateAdviserDto,
  FilterAdvisersDto,
} from './adviser.dto';
import { DealerGroupsService } from '../../dealers/dealerGroups.service';
import { roundToNearestMinutesWithOptions } from 'date-fns/fp';

@Injectable()
export class AdvisersService {
  constructor(
    @InjectRepository(Adviser)
    private adviserRepo: Repository<Adviser>,
    private dealersGroupsService: DealerGroupsService,
  ) {}

  async findAll(params?: FilterAdvisersDto) {
    if (params && Object.keys(params).length !== 0) {
      const { dealerGroupId } = params;

      const searchQuery = this.adviserRepo
        .createQueryBuilder('a')
        .innerJoin('a.dealerGroup', 'dg');

      if (dealerGroupId) searchQuery.andWhere(`dg.id = ${dealerGroupId}`);

      searchQuery.orderBy(`a.name`, 'ASC');

      return await searchQuery.getMany();
    }

    return await this.adviserRepo.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const adviser = await this.adviserRepo.findOne(id);
    if (!adviser) throw new NotFoundException(`Adviser not found.`);
    return adviser;
  }

  async getAdviserBasedOnFullName(fullName: string) {
    const name = fullName.split(' ')[0];
    const lastName = fullName.split(' ')[1];
    return await this.adviserRepo.findOne({
      where: {
        name: Like(`%${name}%`),
        lastName: Like(`%${lastName}%`),
      },
    });
  }

  async create(data: CreateAdviserDto) {
    const newAdviser = this.adviserRepo.create(data);

    if (data.dealerGroupId) {
      const dealerGroup = await this.dealersGroupsService.findOne(
        data.dealerGroupId,
      );
      newAdviser.dealerGroup = dealerGroup;
    }

    return await this.adviserRepo.save(newAdviser);
  }

  async update(id: number, changes: UpdateAdviserDto) {
    const adviser = await this.findOne(id);
    this.adviserRepo.merge(adviser, changes);
    return await this.adviserRepo.save(adviser);
  }

  async remove(id: number) {
    return await this.adviserRepo.delete(id);
  }
}

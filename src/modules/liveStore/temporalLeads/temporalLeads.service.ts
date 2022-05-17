import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TemporalLead } from './temporalLead.entity';
import {
  CreateTemporalLeadDto,
  UpdateTemporalLeadDto,
} from './temporalLead.dto';
import { DealerDealershipsService } from '../../dealers/dealerDealerships.service';

@Injectable()
export class TemporalLeadsService {
  constructor(
    @InjectRepository(TemporalLead)
    private temporalLeadRepo: Repository<TemporalLead>,
    private dealersDealershipsService: DealerDealershipsService,
  ) {}

  async findAll() {
    return await this.temporalLeadRepo.find();
  }

  async findOne(id: number) {
    const temporalLead = await this.temporalLeadRepo.findOne(id);
    if (!temporalLead) throw new NotFoundException(`Temporal Lead not found.`);
    return temporalLead;
  }

  async create(data: CreateTemporalLeadDto) {
    const newTemporalLead = this.temporalLeadRepo.create(data);

    if (data.bac) {
      const dealerDealership = await this.dealersDealershipsService.findByBac(
        data.bac,
      );
      if (!dealerDealership)
        throw new NotFoundException(`Dealership not found.`);
      newTemporalLead.dealerDealership = dealerDealership;
      newTemporalLead.dealerDealershipName = dealerDealership.name;
    }

    return await this.temporalLeadRepo.save(newTemporalLead);
  }

  async update(id: number, changes: UpdateTemporalLeadDto) {
    const temporalLead = await this.findOne(id);
    this.temporalLeadRepo.merge(temporalLead, changes);
    return await this.temporalLeadRepo.save(temporalLead);
  }

  async remove(id: number) {
    return await this.temporalLeadRepo.delete(id);
  }
}

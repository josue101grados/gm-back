import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { SalesAssignation } from './saleAssignation.entity';
import {
  CreateSaleAssignationDto,
  UpdateSaleAssignationDto,
} from './saleAssignation.dto';

@Injectable()
export class SalesAssignationsService {
  constructor(
    @InjectRepository(SalesAssignation)
    private saleAssignationRepo: Repository<SalesAssignation>,
  ) {}

  async findAll() {
    return await this.saleAssignationRepo.find();
  }

  async findOne(id: number) {
    const saleAssignation = await this.saleAssignationRepo.findOne(id);
    if (!saleAssignation)
      throw new NotFoundException(`Sale Assignation Rule not found.`);
    return saleAssignation;
  }

  async create(data: CreateSaleAssignationDto) {
    const newSaleAssignation = this.saleAssignationRepo.create(data);

    if (!data.fromLeadsDate && !data.toLeadsDate)
      throw new BadRequestException('Please provide from and to date.');

    if (
      !data.take120FranchiseSales &&
      !data.take360FranchiseSales &&
      !data.takeXTimeFranchiseSales
    )
      throw new BadRequestException(
        'Please select at least one franchise rule.',
      );

    if (data.take120FranchiseSales && data.take360FranchiseSales)
      throw new BadRequestException('Please select only one franchise rule.');

    if (
      !data.take120OverallSales &&
      !data.take360OverallSales &&
      !data.takeXTimeOverallSales
    )
      throw new BadRequestException('Please select at least one overall rule.');

    if (data.take120OverallSales && data.take360OverallSales)
      throw new BadRequestException('Please select only one overall rule.');

    newSaleAssignation.fromLeadsDate = new Date(
      `${data.fromLeadsDate} 00:00:00`,
    );
    newSaleAssignation.toLeadsDate = new Date(`${data.toLeadsDate} 23:59:59`);

    return await this.saleAssignationRepo.save(newSaleAssignation);
  }

  async getActiveRulesFromRange(year: number, month: number) {
    return await this.saleAssignationRepo.find({
      where: {
        isActive: true,
        fromLeadsDate: LessThanOrEqual(new Date(year, month, 0)),
        toLeadsDate: MoreThanOrEqual(new Date(year, month, 0)),
      },
    });
  }

  async getActiveRules() {
    return await this.saleAssignationRepo.find({
      where: { isActive: true },
    });
  }

  async update(id: number, changes: UpdateSaleAssignationDto) {
    const saleAssignation = await this.findOne(id);
    this.saleAssignationRepo.merge(saleAssignation, changes);

    return await this.saleAssignationRepo.save(saleAssignation);
  }

  async remove(id: number) {
    return await this.saleAssignationRepo.delete(id);
  }
}

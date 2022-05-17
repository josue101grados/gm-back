import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Exception } from './exception.entity';
import { CreateExceptionDto, UpdateExceptionDto } from './dto/exceptions.dto';
import { ModelsService } from '../models/models.service';

@Injectable()
export class ExceptionsService {
  constructor(
    @InjectRepository(Exception)
    private exceptionRepo: Repository<Exception>,
    private modelsService: ModelsService,
  ) {}

  async findOneByOpName(opName: string) {
    const exception = await this.exceptionRepo.findOne({
      where: { opportunityName: opName },
    });
    return exception;
  }

  async createException(data: CreateExceptionDto) {
    const exception = await this.findOneByOpName(data.opportunityName);
    if (!exception) {
      const newException = this.exceptionRepo.create(data);
      if (data.modelId) {
        const model = await this.modelsService.findOne(data.modelId);
        newException.model = model;
      }
      newException.isValid = data.derivationDate >= data.siebelDate;
      return await this.exceptionRepo.save(newException);
    } else {
      return await this.updateException(data.opportunityName, data);
    }
  }

  async updateException(opName: string, changes: UpdateExceptionDto) {
    const exception = await this.findOneByOpName(opName);

    this.exceptionRepo.merge(exception, changes);

    if (changes.modelId) {
      const model = await this.modelsService.findOne(changes.modelId);
      exception.model = model;
    }

    if (changes.derivationDate)
      exception.isValid = changes.derivationDate >= exception.siebelDate;

    if (changes.siebelDate)
      exception.isValid = exception.derivationDate >= changes.siebelDate;

    if (changes.derivationDate && changes.siebelDate)
      exception.isValid = changes.derivationDate >= changes.siebelDate;

    return await this.exceptionRepo.save(exception);
  }
}

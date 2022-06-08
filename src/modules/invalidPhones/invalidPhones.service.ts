import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { InvalidPhone } from './invalidPhone.entity';

@Injectable()
export class InvalidPhonesService extends TypeOrmCrudService<InvalidPhone> {
  constructor(@InjectRepository(InvalidPhone) repo) {
    super(repo);
  }
}

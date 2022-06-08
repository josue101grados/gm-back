import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Role } from './role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService extends TypeOrmCrudService<Role> {
  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
  ) {
    super(rolesRepository);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserPasswordHistory } from './userPasswordHistory.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesModule } from 'modules/roles/roles.module';
import { UtilitiesModule } from 'modules/utilities/utilities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPasswordHistory]),
    RolesModule,
    UtilitiesModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

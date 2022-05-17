import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, UpdateResult } from 'typeorm';
import { User } from './user.entity';
import { UserPasswordHistory } from './userPasswordHistory.entity';
import { hash } from 'bcrypt';
import { UtilitiesService } from '../utilities/utilities.service';
import * as bcrypt from 'bcrypt';

import moment = require('moment');
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPasswordHistory)
    private usersPasswordHistory: Repository<UserPasswordHistory>,

    private utilities: UtilitiesService,
  ) {
    super(usersRepository);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findById(id: number): Promise<User> {
    return await this.usersRepository.findOne({
      id: Equal(id),
    });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['roles', 'dealerGroup'],
    });
  }

  async setLastLogin(id: number): Promise<UpdateResult> {
    return await this.usersRepository.update(
      { id },
      { lastLoginAt: moment().format() },
    );
  }

  async updatePassword(id: number, password: string) {
    const credentialsExpireAt = this.utilities.getExpirationPasswordDate();

    const isAvalidPassword = await this.addPasswordHistory(id, password);

    if (isAvalidPassword) {
      return await this.usersRepository.update(id, {
        password: await hash(password, 8),
        credentialsExpireAt,
      });
    } else {
      throw new HttpException(
        'Password had been used before',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async addPasswordHistory(id: number, password: string) {
    const lastFivePasswords = await this.getLastFivePasswords(id);
    let hasTheSamePassword = false;

    // Verifiy and compare the new password with the last 5
    for (const savedPassword of lastFivePasswords) {
      if (await bcrypt.compare(password, savedPassword.password)) {
        hasTheSamePassword = true;
        // If is the same password used before, the whole function returns false
        return false;
      }
    }

    if (!hasTheSamePassword) {
      // Just if the user has more than 5 password I delete the oldest one
      if (lastFivePasswords.length >= 5) {
        await this.removePasswordHistory(id);
      }

      await this.usersPasswordHistory.save({
        password: await hash(password, 8),
        user: {
          id: id,
        },
      });
    }

    // If the password was added it returns true
    return true;
  }

  async getLastFivePasswords(userId: number) {
    const lastFivePasswords = await this.usersPasswordHistory
      .createQueryBuilder('uph')
      .select('uph.id', 'id')
      .addSelect('uph.password', 'password')
      .addSelect('uph.userId', 'userId')
      .where(`uph.userId = ${userId}`)
      .orderBy('uph.id', 'ASC')
      .getRawMany();
    return lastFivePasswords;
  }

  async removePasswordHistory(userId: number) {
    const oldestPassword = await this.usersPasswordHistory
      .createQueryBuilder('uph')
      .select('uph.id')
      .where(`uph.userId = ${userId}`)
      .orderBy('uph.id', 'ASC')
      .limit(1)
      .getRawOne();

    await this.usersPasswordHistory
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: oldestPassword.uph_id })
      .execute();
  }

  async incrementLoginAttempts(userId) {
    const validAttempts = 3; // Number of valid attempts

    await this.usersRepository
      .createQueryBuilder()
      .update()
      .where(`id = ${userId}`)
      .set({ loginAttempts: () => 'loginAttempts + 1' })
      .execute();

    const { loginAttempts } = await this.usersRepository
      .createQueryBuilder()
      .select('loginAttempts')
      .where(`id =${userId}`)
      .getRawOne();

    if (loginAttempts >= validAttempts) {
      await this.invalidateUser(userId);
    }
  }

  async invalidateUser(userId) {
    // If the user increase his loginAttents he would be penalized being Unactive
    await this.usersRepository
      .createQueryBuilder()
      .update()
      .where(`id = ${userId}`)
      .set({ isActive: false })
      .execute();
  }

  async resetLoginAttempts(userId) {
    await this.usersRepository
      .createQueryBuilder()
      .update()
      .where(`id = ${userId}`)
      .set({ loginAttempts: 0 })
      .execute();
  }

  async informationAboutCredentialsExpiration(userId) {
    const currentDate = new Date();
    let { credentialsExpireAt } = await this.usersRepository
      .createQueryBuilder()
      .select('credentialsExpireAt')
      .where(`id = ${userId}`)
      .getRawOne();
    credentialsExpireAt = new Date(credentialsExpireAt);
    const fiveDaysBefore = new Date(
      moment(credentialsExpireAt)
        .subtract(5, 'day')
        .toISOString(),
    );

    if (fiveDaysBefore <= currentDate) {
      if (currentDate >= credentialsExpireAt) {
        return {
          areSoonToExpire: true,
          areExpired: true,
          credentialsExpireAt,
        };
      } else {
        return {
          areSoonToExpire: true,
          areExpired: false,
          credentialsExpireAt,
        };
      }
    } else {
      return {
        areSoonToExpire: false,
        areExpired: false,
        credentialsExpireAt,
      };
    }
  }
}

import {
  Controller,
  UseGuards,
  Get,
  Req,
  Patch,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  Crud,
  CrudController,
  Override,
  ParsedRequest,
  CrudRequest,
  ParsedBody,
} from '@nestjsx/crud';
import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { Roles } from 'modules/auth/guards/roles.decorator';
import { RolesGuard } from 'modules/auth/guards/roles.guard';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { RolesService } from 'modules/roles/role.service';
import { UtilitiesService } from 'modules/utilities/utilities.service';
import { In } from 'typeorm';

@Crud({
  model: {
    type: User,
  },
  query: {
    exclude: ['password'],
    join: {
      roles: { eager: true },
      dealerGroup: { eager: true },
    },
  },
  routes: {
    only: ['createOneBase', 'getManyBase', 'getOneBase', 'updateOneBase'],
    updateOneBase: {
      decorators: [Roles('admin')],
    },
    createOneBase: {
      decorators: [Roles('admin')],
    },
    getOneBase: {
      decorators: [Roles('admin')],
    },
    getManyBase: {
      decorators: [Roles('admin', 'nodo')],
    },
  },
})
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController implements CrudController<User> {
  constructor(
    public service: UsersService,
    private rolesService: RolesService,
    private utilities: UtilitiesService,
  ) {}

  get base(): CrudController<User> {
    return this;
  }

  @Override('createOneBase')
  async createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: User) {
    if (dto.roles && dto.roles.length) {
      const credentialsExpireAt = this.utilities.getTemporalExpirationPasswordDate();

      dto.roles = await this.rolesService.find({
        name: In(dto.roles as string[]),
      });
      dto.credentialsExpireAt = credentialsExpireAt;
    }

    const insertedId = (await this.base.createOneBase(req, dto)).id;
    const password = dto.password;

    return this.service.addPasswordHistory(insertedId, password);
  }

  @Override('updateOneBase')
  async updateOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: User) {
    if (dto.roles && dto.roles.length) {
      dto.roles = await this.rolesService.find({
        name: In(dto.roles as string[]),
      });
    }

    if (dto.password) {
      // Está cambiando la contraseña
      const isAValidPassword = await this.service.addPasswordHistory(
        dto.id,
        dto.password,
      );

      if (isAValidPassword) {
        const credentialsExpireAt = this.utilities.getExpirationPasswordDate();
        dto.credentialsExpireAt = credentialsExpireAt;

        return this.base.updateOneBase(req, dto);
      } else {
        throw new HttpException(
          'Password had been used before',
          HttpStatus.FORBIDDEN,
        );
      }
    } else {
      return this.base.updateOneBase(req, dto);
    }
  }

  @Get('me')
  async getMyUser(@Req() req) {
    return await this.service.findOne(req.user.userId, {
      select: [
        'email',
        'id',
        'fullName',
        'isActive',
        'updatedAt',
        'createdAt',
        'lastLoginAt',
      ],
      relations: ['roles', 'dealerGroup'],
    });
  }

  @Roles('admin', 'dealer')
  @Patch('me/password')
  async updateMyPassword(@Req() req, @Body() body) {
    if (!body.password) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }
    return this.service.updatePassword(req.user.userId, body.password);
  }
}

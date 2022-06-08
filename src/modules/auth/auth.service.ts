import * as bcrypt from 'bcrypt';
import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  // exception
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtDto } from './dto/Jwt.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessToken } from './accessToken.entity';
import { RefreshToken } from './refreshToken.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { uid } from 'rand-token';
import { unix } from 'moment';
import { Role } from 'modules/roles/role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AccessToken)
    private readonly accessTokenRepository: Repository<AccessToken>,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepository: Repository<RefreshToken>,
    private usersService: UsersService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    // First search if the user exists
    if (!user) {
      throw new UnauthorizedException('No user found');
    }
    // Second we campare the passwords
    if (!(await bcrypt.compare(password, user.password))) {
      await this.usersService.incrementLoginAttempts(user.id);
      throw new UnauthorizedException('Wrong credentials');
    }

    await this.usersService.resetLoginAttempts(user.id);
    return user;
  }

  async login(user: User): Promise<JwtDto> {
    this.usersService.setLastLogin(user.id);
    return await this.createTokens(user);
  }

  async refresh(token: string): Promise<JwtDto> {
    try {
      const refreshData = this.jwtService.verify(token);

      const refreshToken = await this.refreshRepository.findOne({
        where: { id: refreshData.jti },
        join: {
          alias: 'refreshToken',
          leftJoinAndSelect: {
            accessToken: 'refreshToken.accessToken',
            user: 'accessToken.user',
          },
        },
      });

      if (!refreshToken || refreshToken.revoked) {
        throw new Error('Refresh token not recognized');
      }

      refreshToken.revoked = true;
      await this.refreshRepository.save(refreshToken);
      refreshToken.accessToken.revoked = true;
      await this.accessTokenRepository.save(refreshToken.accessToken);

      this.usersService.setLastLogin(refreshToken.accessToken.user.id);
      // Find the full user here because refreshToken does not contain user roles
      const fullUser = await this.usersService.findByUsername(
        refreshToken.accessToken.user.username,
      );
      return this.createTokens(fullUser);
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async createTokens(user: User): Promise<JwtDto> {
    const id = uid(64);
    const refreshId = uid(64);
    const accessPayload = {
      username: user.username,
      sub: user.id,
      roles: (user.roles as Role[]).map(r => r.name),
      dealerGroupId: user.dealerGroup ? user.dealerGroup.id : null,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      jwtid: id,
    });

    const tokenData: any = this.jwtService.decode(accessToken);

    const refreshToken = this.jwtService.sign(
      {},
      {
        expiresIn: this.configService.get('REFRESH_EXPIRATION'),
        jwtid: refreshId,
      },
    );

    const accessTokenDB = await this.accessTokenRepository.save({
      id,
      user: await this.usersService.findById(user.id),
      expiresAt: unix(tokenData.exp).format(),
    });

    await this.refreshRepository.save({
      id: refreshId,
      accessToken: accessTokenDB,
      expiresAt: unix(
        (this.jwtService.decode(refreshToken) as any).exp,
      ).format(),
    });

    // Verify the password expiration time
    const {
      areSoonToExpire,
      areExpired,
      credentialsExpireAt,
    } = await this.usersService.informationAboutCredentialsExpiration(user.id);

    return {
      accessToken,
      refreshToken,
      role: accessPayload.roles[0],
      username: accessPayload.username,
      dealerGroupId: accessPayload.dealerGroupId,
      areSoonToExpire,
      areExpired,
      credentialsExpireAt,
    };
  }
}

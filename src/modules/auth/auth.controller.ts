import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  HttpException,
  HttpStatus,
  HttpCode,
  Query,
  ClassSerializerInterceptor,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
// import { ResetPasswordTokenService } from './resetPasswordToken/resetPasswordToken.service';
import { ConfigService } from '@nestjs/config';
import { PasswordResetDto } from './dto/PasswordReset.dto';
import { UpdatePasswordDto } from './dto/UpdatePassword.dto';
import { RefreshTokenDto } from './dto/RefreshToken.dto';
import { JwtDto } from './dto/Jwt.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller()
@UsePipes(ValidationPipe)
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  private appUrl: string;

  constructor(
    private readonly authService: AuthService,
    // private readonly emailService: EmailService,
    // private readonly tokenService: ResetPasswordTokenService,
    // private readonly guestTokenService: GuestTokenService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.appUrl = configService.get('APP_URL');
  }

  @UseGuards(LocalAuthGuard)
  @ApiConsumes('username', 'password')
  @Post('auth/login')
  async login(@Request() req): Promise<JwtDto> {
    return this.authService.login(req.user);
  }

  @Post('auth/refresh')
  async refreshToken(@Body() body: RefreshTokenDto): Promise<JwtDto> {
    return this.authService.refresh(body.refreshToken);
  }

  // @Post('reset-password')
  // async resetPassword(@Body() passwordReset: PasswordResetDto) {
  //   const requestingUser = await this.userService.findByEmail(
  //     passwordReset.email,
  //   );
  //   if (!requestingUser) {
  //     throw new HttpException(
  //       'We do not recognize that email',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const existingToken = await this.tokenService.findByUserId(
  //     requestingUser.id,
  //   );
  //   if (existingToken) {
  //     throw new HttpException(
  //       'Reset email has already been sent',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const newToken = await this.tokenService.createToken(requestingUser);
  //   await this.emailService.sendResetPassword({
  //     to: requestingUser.email,
  //     context: {
  //       name: requestingUser.name,
  //       resetUrl: `${this.appUrl}/recovery/${newToken.token}`,
  //     },
  //   });
  // }

  // @Post('refresh')
  // async refreshToken(@Body() body: RefreshTokenDto): Promise<JwtDto> {
  //   return this.authService.refresh(body.refreshToken);
  // }

  // @Get('reset-password/validate')
  // async validateResetToken(@Query('token') token: string) {
  //   const tokenIsValid = await this.tokenService.validateToken(token);
  //   if (!tokenIsValid) {
  //     throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
  //   }
  //   return await this.tokenService.findToken(token);
  // }

  // @HttpCode(200)
  // @Post('reset-password/update')
  // async updatePasswordWithToken(@Body() updatePassword: UpdatePasswordDto) {
  //   const token = await this.tokenService.findToken(updatePassword.token);
  //   if (!token) {
  //     throw new HttpException('Invalid Token', HttpStatus.BAD_REQUEST);
  //   }
  //   await this.tokenService.consumeToken(token);
  //   return await this.userService.updatePassword(
  //     updatePassword.password,
  //     token.owner.id,
  //   );
  // }
}

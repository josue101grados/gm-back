import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InstanceGuard implements CanActivate {
  instanceApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.instanceApiKey = this.configService.get('API_KEY');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    return authorization === this.instanceApiKey;
  }
}

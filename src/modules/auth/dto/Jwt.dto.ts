import { ApiProperty } from '@nestjs/swagger';

export class JwtDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  dealerGroupId: number;

  @ApiProperty()
  areSoonToExpire: boolean;

  @ApiProperty()
  areExpired: boolean;

  @ApiProperty()
  credentialsExpireAt: Date;
}

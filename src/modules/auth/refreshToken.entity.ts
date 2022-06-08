import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { AccessToken } from './accessToken.entity';

@Entity({
  name: 'refresh_tokens',
})
export class RefreshToken {
  @PrimaryColumn()
  id: string;

  @ManyToOne(type => AccessToken, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'accessTokenId',
  })
  accessToken: AccessToken;

  @Column({
    default: false,
  })
  revoked: boolean;

  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;
}

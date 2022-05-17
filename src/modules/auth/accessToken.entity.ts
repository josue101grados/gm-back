import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  Column,
  JoinColumn,
  Timestamp,
} from 'typeorm';
import { User } from './../users/user.entity';

@Entity({
  name: 'access_tokens',
})
export class AccessToken {
  @PrimaryColumn()
  id: string;

  @ManyToOne(type => User)
  @JoinColumn({
    name: 'userId',
  })
  user: User;

  @Column({
    default: false,
  })
  revoked: boolean;

  @Column({
    type: 'timestamp',
  })
  expiresAt: Timestamp;
}

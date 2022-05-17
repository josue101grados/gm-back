import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity({
  name: 'reset_password_tokens',
})
export class ResetPasswordToken {
  @PrimaryColumn('varchar')
  token: string;

  @Column()
  expiresAt: Date;

  @ManyToOne(
    type => User,
    user => user.tokens,
  )
  owner: User;
}

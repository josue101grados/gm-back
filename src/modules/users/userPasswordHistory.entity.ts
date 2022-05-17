import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsOptional, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { User } from './user.entity';
import { hash } from 'bcrypt';
import { CrudValidationGroups } from '@nestjsx/crud';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'user_password_history',
})
export class UserPasswordHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MinLength(16)
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ManyToOne(
    type => User,
    user => user.usersPasswordHistory,
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hash(this.password, 8);
    }
  }
}

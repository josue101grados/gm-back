import {
  CreateDateColumn,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
  IsEmail,
  MinLength,
} from 'class-validator';
import { ResetPasswordToken } from '../auth/resetPasswordToken/resetPasswordToken.entity';
import { Role } from 'modules/roles/role.entity';
import { UserPasswordHistory } from './userPasswordHistory.entity';
import { InxaitRecoveryEmail } from '../inxaitRecoveryEmails/inxaitRecoveryEmail.entity';
import { Visit } from 'modules/visits/visit.entity';
import { Task } from 'modules/tasks/task.entity';
import { CrudValidationGroups } from '@nestjsx/crud';
import { hash } from 'bcrypt';
import { DealerGroup } from 'modules/dealers/dealerGroup.entity';
import { ExpertsInterval } from 'modules/expertsIntervals/expertsInterval.entity';
import { LiveStore } from '../liveStore/liveStore.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255 })
  username: string;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsEmail()
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index('IDX_users_email', { unique: true })
  email: string;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'fullname' })
  fullName: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MinLength(16)
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt: Timestamp;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gmailEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  instance: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Increase in 1 if the login failed',
  })
  loginAttempts: number;

  @Column({ type: 'timestamp' })
  credentialsExpireAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hash(this.password, 8);
    }
  }

  @OneToMany(
    type => ResetPasswordToken,
    token => token.owner,
  )
  tokens: ResetPasswordToken[];

  @ManyToMany(
    type => Role,
    role => role.users,
    { eager: true },
  )
  @JoinTable({
    name: 'users_roles',
  })
  roles: Role[] | string[];

  @OneToMany(
    type => InxaitRecoveryEmail,
    inxaitRecoveryEmail => inxaitRecoveryEmail.responsible,
  )
  inxaitRecoveryEmails: Promise<InxaitRecoveryEmail[]>;

  @OneToMany(
    type => Visit,
    visit => visit.user,
  )
  visits: Promise<Visit[]>;

  @OneToMany(
    type => Task,
    task => task.user,
  )
  tasks: Promise<Task[]>;

  @ManyToOne(
    type => DealerGroup,
    dealerGroup => dealerGroup.users,
  )
  dealerGroup: DealerGroup;

  @OneToMany(
    type => ExpertsInterval,
    expertsInterval => expertsInterval.user,
  )
  expertsIntervals: Promise<ExpertsInterval[]>;

  @OneToMany(
    type => UserPasswordHistory,
    userPasswordHistory => userPasswordHistory.user,
  )
  usersPasswordHistory: UserPasswordHistory[];

  @OneToMany(
    () => LiveStore,
    liveStore => liveStore.user,
  )
  liveStores: LiveStore[];
}

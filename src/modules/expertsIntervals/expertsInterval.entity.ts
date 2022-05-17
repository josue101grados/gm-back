import {
  Entity,
  Column,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { IsOptional, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { User } from '../users/user.entity';
import { CrudValidationGroups } from '@nestjsx/crud';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'experts_intervals',
})
export class ExpertsInterval {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ groups: [CREATE] })
  @ManyToOne(
    type => User,
    user => user.expertsIntervals,
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column('boolean', { default: false })
  monday: boolean;

  @Column('boolean', { default: false })
  tuesday: boolean;

  @Column('boolean', { default: false })
  wednesday: boolean;

  @Column('boolean', { default: false })
  thursday: boolean;

  @Column('boolean', { default: false })
  friday: boolean;

  @Column('boolean', { default: false })
  saturday: boolean;

  @Column('boolean', { default: false })
  sunday: boolean;

  @Column({ type: 'time', nullable: true })
  from: Date;

  @Column({ type: 'time', nullable: true })
  to: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;
}
import {
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('sales_assignations')
export class SalesAssignation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isActive: boolean;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  fromLeadsDate: Date;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  toLeadsDate: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  take120FranchiseSales: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  take120OverallSales: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  take360FranchiseSales: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  take360OverallSales: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  takeXTimeFranchiseSales: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  takeXTimeOverallSales: boolean;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;
}

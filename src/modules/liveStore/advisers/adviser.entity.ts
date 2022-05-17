import {
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { LiveStore } from '../liveStore.entity';
import { DealerGroup } from '../../dealers/dealerGroup.entity';

@Entity('advisers')
export class Adviser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: '32',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: '32',
    nullable: false,
  })
  lastName: string;

  @ManyToOne(
    () => DealerGroup,
    dealerGroup => dealerGroup.advisers,
  )
  @JoinColumn({ name: 'dealerGroupId' })
  dealerGroup: DealerGroup;

  @OneToMany(
    () => LiveStore,
    liveStore => liveStore.adviser,
  )
  liveStores: LiveStore[];

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

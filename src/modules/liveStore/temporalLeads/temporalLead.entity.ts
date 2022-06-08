import {
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { DealerDealership } from '../../dealers/dealerDealership.entity';
import { LiveStore } from '../liveStore.entity';

@Entity('temporal_leads')
export class TemporalLead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 40,
    nullable: false,
    unique: true,
  })
  opportunityName: string;

  @Column({ length: 255, nullable: true })
  document: string;

  @Column({ length: 255, nullable: true, comment: 'Nombres' })
  names: string;

  @Column({ length: 255, nullable: true, comment: 'Apellidos' })
  lastNames: string;

  @Column({ length: 255 })
  modelName: string;

  @Column({ length: 255 })
  campaignName: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  mobile: string;

  @Column({ length: 255 })
  dealerDealershipName: string;

  @ManyToOne(
    type => DealerDealership,
    dealerDealership => dealerDealership.temporalLeads,
  )
  @JoinColumn({ name: 'dealerDealershipId' })
  dealerDealership: DealerDealership;

  @OneToOne(
    () => LiveStore,
    liveStore => liveStore.temporalLead,
  )
  liveStore: LiveStore;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

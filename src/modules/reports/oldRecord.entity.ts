import {
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

import { DealerCity } from '../dealers/dealerCity.entity';

@Entity({
  name: 'old_records',
})
export class OldRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => DealerCity,
    dealerCity => dealerCity.oldRecords,
  )
  @JoinColumn({ name: 'dealerCityId' })
  dealerCity: DealerCity;

  @Column({ length: 7 })
  yearMonth: string;

  @Column({ nullable: false })
  won: number;

  @Column({ nullable: false })
  delivered: number;
}

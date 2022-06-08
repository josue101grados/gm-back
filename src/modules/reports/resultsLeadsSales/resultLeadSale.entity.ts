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

import { DealerGroup } from '../../dealers/dealerGroup.entity';
import { DealerCity } from '../../dealers/dealerCity.entity';
import { DealerDealership } from '../../dealers/dealerDealership.entity';

@Entity('results_leads_sales')
export class ResultLeadsSales {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
  })
  are120results: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  are360results: boolean;

  @Column({
    type: 'int',
    nullable: false,
  })
  leadMonth: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  leadYear: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  january: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  february: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  march: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  april: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  may: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  june: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  july: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  august: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  september: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  october: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  november: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  december: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  validLeads: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  totalSales: number;

  @Column({
    type: 'float',
    nullable: false,
    default: 0,
  })
  closingRate: number;

  @ManyToOne(
    () => DealerGroup,
    dealerGroup => dealerGroup.resultsLeadsSales,
  )
  dealerGroup: DealerGroup;

  @ManyToOne(
    () => DealerCity,
    dealerCity => dealerCity.resultsLeadsSales,
  )
  dealerCity: DealerCity;

  @ManyToOne(
    () => DealerDealership,
    dealerDealership => dealerDealership.resultsLeadsSales,
  )
  dealerDealership: DealerDealership;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;
}

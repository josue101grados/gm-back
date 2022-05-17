import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { DealerDealership } from './dealerDealership.entity';
import { DealerGroup } from './dealerGroup.entity';
import { OldRecord } from '../reports/oldRecord.entity';
import { Zone } from '../zones/zone.entity';
import { CrudValidationGroups } from '@nestjsx/crud';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'dealer_cities',
})
export class DealerCity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(6, { always: true })
  @Column({
    type: 'varchar',
    length: 6,
    nullable: false,
    comment: 'main BAC',
  })
  mainBac: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, comment: 'Dealer de Ciudad' })
  @Index('IDX_dealer_cities_name')
  name: string;

  @ManyToOne(
    type => Zone,
    zone => zone.dealerCities,
  )
  @JoinColumn({ name: 'zoneId' })
  zone: Zone;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', {
    default: false,
    name: 'ignoreDealerCity',
  })
  ignore: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @OneToMany(
    type => DealerDealership,
    dealerDealership => dealerDealership.dealerCity,
  )
  dealerDealerships: Promise<DealerDealership[]>;

  @IsNotEmpty({ groups: [CREATE] })
  @ManyToOne(
    type => DealerGroup,
    dealerGroup => dealerGroup.dealerCities,
  )
  @JoinColumn({ name: 'dealerGroupId' })
  dealerGroup: DealerGroup;

  @OneToMany(
    type => OldRecord,
    oldRecord => oldRecord.dealerCity,
  )
  oldRecords: Promise<OldRecord[]>;
}

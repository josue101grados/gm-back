import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
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
import { CrudValidationGroups } from '@nestjsx/crud';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'dealer_dealership_aliases',
})
export class DealerDealershipAlias {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255 })
  @Index('IDX_dealer_aliases_name', { unique: true })
  name: string;

  @IsNotEmpty({ groups: [CREATE] })
  @ManyToOne(
    type => DealerDealership,
    dealerDealership => dealerDealership.dealerDealershipAliases,
  )
  @JoinColumn({ name: 'dealerDealershipId' })
  dealerDealership: DealerDealership;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;
}

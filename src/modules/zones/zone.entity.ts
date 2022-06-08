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
import { Sale } from '../sales/sale.entity';
import { DealerDealership } from '../dealers/dealerDealership.entity';
import { DealerCity } from '../dealers/dealerCity.entity';
import { CrudValidationGroups } from '@nestjsx/crud';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'zones',
})
export class Zone {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(
    type => DealerCity,
    dealerCity => dealerCity.zone,
  )
  dealerCities: Promise<DealerCity[]>;

  @OneToMany(
    type => Sale,
    sale => sale.zone,
  )
  sales: Promise<Sale[]>;
}

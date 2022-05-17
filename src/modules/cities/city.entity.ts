import {
  Entity,
  Column,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsOptional, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { CityAlias } from './cityAlias.entity';
import { DealerDealership } from '../dealers/dealerDealership.entity';
import { Lead } from '../leads/lead.entity';
import { Sale } from '../sales/sale.entity';
import { CrudValidationGroups } from '@nestjsx/crud';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'cities',
})
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255 })
  @Index('IDX_cities_name', { unique: true })
  name: string;

  @OneToMany(
    type => CityAlias,
    cityAlias => cityAlias.city,
  )
  cityAliases: Promise<CityAlias[]>;

  @OneToMany(
    type => DealerDealership,
    dealerDealership => dealerDealership.city,
  )
  dealerDealerships: Promise<DealerDealership[]>;

  @OneToMany(
    type => Lead,
    lead => lead.city,
  )
  leads: Promise<Lead[]>;

  @OneToMany(
    type => Sale,
    sale => sale.city,
  )
  sales: Promise<Sale[]>;
}

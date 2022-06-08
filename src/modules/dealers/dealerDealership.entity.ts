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
import { IsOptional, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { City } from '../cities/city.entity';
import { DealerDealershipAlias } from './dealerDealershipAlias.entity';
import { InxaitRecoveryEmail } from '../inxaitRecoveryEmails/inxaitRecoveryEmail.entity';
import { DealerCity } from './dealerCity.entity';
import { Lead } from '../leads/lead.entity';
import { Sale } from '../sales/sale.entity';
import { CrudValidationGroups } from '@nestjsx/crud';
import { TemporalLead } from '../liveStore/temporalLeads/temporalLead.entity';
import { ResultLeadsSales } from '../reports/resultsLeadsSales/resultLeadSale.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'dealer_dealerships',
})
export class DealerDealership {
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
    comment: 'BAC',
  })
  @Index('IDX_dealer_dealerships_bac', { unique: true })
  bac: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Dealership_Name',
  })
  @Index('IDX_dealer_dealerships_name')
  name: string;

  @IsNotEmpty({ groups: [CREATE] })
  @ManyToOne(
    type => DealerCity,
    dealerCity => dealerCity.dealerDealerships,
  )
  @JoinColumn({ name: 'dealerCityId' })
  dealerCity: DealerCity;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Address_Line_1',
  })
  addressLine1: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Ciudad' })
  cityName: string;

  @ManyToOne(
    type => City,
    city => city.dealerDealerships,
  )
  @JoinColumn({ name: 'cityId' })
  city: City;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(12, { always: true })
  @Column({ type: 'varchar', length: 12, nullable: true, comment: 'Telephone' })
  telephone: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Email para notificar Reporte Siebel',
  })
  siebelReportEmail: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'CRM OD Email',
  })
  crmOdEmail: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Image' })
  image: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Whatsapp' })
  whatsapp: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  urlLocation: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  urlFacebook: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  urlYoutube: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  urlTwitter: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  urlGplus: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  urlInstagram: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  urlWebsite: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @OneToMany(
    type => DealerDealershipAlias,
    dealerDealershipAlias => dealerDealershipAlias.dealerDealership,
  )
  dealerDealershipAliases: Promise<DealerDealershipAlias[]>;

  @OneToMany(
    type => InxaitRecoveryEmail,
    inxaitRecoveryEmail => inxaitRecoveryEmail.dealerDealership,
  )
  inxaitRecoveryEmails: Promise<InxaitRecoveryEmail[]>;

  @OneToMany(
    type => Lead,
    lead => lead.dealerDealership,
  )
  leads: Promise<Lead[]>;

  @OneToMany(
    type => Sale,
    sale => sale.dealerDealership,
  )
  sales: Promise<Sale[]>;

  @OneToMany(
    type => TemporalLead,
    temporalLeads => temporalLeads.dealerDealership,
  )
  temporalLeads: TemporalLead[];

  @OneToMany(
    () => ResultLeadsSales,
    resultsLeadsSales => resultsLeadsSales.dealerDealership,
  )
  resultsLeadsSales: ResultLeadsSales;
}

import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
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
import { CampaignAlias } from './campaignAlias.entity';
import { Lead } from '../leads/lead.entity';
import { CrudValidationGroups } from '@nestjsx/crud';

const { CREATE, UPDATE } = CrudValidationGroups;

export enum TierTypes {
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
}

@Entity({
  name: 'campaigns',
})
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(30, { always: true })
  @Column({ type: 'varchar', length: 30, nullable: false })
  @Index('IDX_campaigns_code', { unique: true })
  code: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(80, { always: true })
  @Column({ type: 'varchar', length: 80, nullable: false })
  type: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  source: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  isDdp: boolean;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(30, { always: true })
  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: 'ID de acción',
  })
  actionId: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(60, { always: true })
  @Column({
    type: 'varchar',
    length: 60,
    nullable: true,
    comment: 'Tipo de Contenido',
  })
  contentType: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  validateSelfDuplicates: boolean;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  sendFirstContactEmail: boolean;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: true })
  directsUpload: boolean;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', {
    default: false,
    name: 'ignoreCampaign',
  })
  ignore: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({
    type: 'enum',
    enum: TierTypes,
    nullable: true,
  })
  tier: TierTypes;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @OneToMany(
    type => CampaignAlias,
    campaignAlias => campaignAlias.campaign,
  )
  campaignAliases: Promise<CampaignAlias[]>;

  @OneToMany(
    type => Lead,
    lead => lead.campaign,
  )
  leads: Promise<Lead[]>;
}

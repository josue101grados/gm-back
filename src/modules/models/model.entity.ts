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
  IsDecimal,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { ModelAlias } from './modelAlias.entity';
import { Lead } from '../leads/lead.entity';
import { Sale } from '../sales/sale.entity';
import { Exception } from '../exceptions/exception.entity';
import { Segment } from '../segments/segment.entity';
import { CrudValidationGroups } from '@nestjsx/crud';
import { Event } from 'modules/events/event.entity';

const { CREATE, UPDATE } = CrudValidationGroups;
export enum EmailTypes {
  FIRST_CONTACT = 'first_contact',
  LIVE_STORE = 'live_store',
}
const emailTypes = [EmailTypes.FIRST_CONTACT, EmailTypes.LIVE_STORE];
@Entity({
  name: 'models',
})
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @ManyToOne(
    type => Segment,
    segment => segment.models,
  )
  @JoinColumn({ name: 'segmentId' })
  segment: Segment;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index('IDX_models_family')
  family: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Modelo' })
  @Index('IDX_models_model')
  model: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Imagen' })
  image: string;

  @Column({ length: 255, comment: 'Imagen Adicional', nullable: true })
  additionalImage: string;

  @Column({ length: 255, nullable: true })
  url: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsDecimal()
  @Column('numeric', { precision: 12, scale: 2 })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @OneToMany(
    type => ModelAlias,
    modelAlias => modelAlias.model,
  )
  modelAliases: Promise<ModelAlias[]>;

  @OneToMany(
    type => Lead,
    lead => lead.model,
  )
  leads: Promise<Lead[]>;

  @OneToMany(
    type => Sale,
    sale => sale.model,
  )
  sales: Promise<Sale[]>;

  @OneToMany(
    type => Exception,
    sale => sale.model,
  )
  exeptions: Promise<Exception[]>;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(50, { always: true })
  @IsIn(emailTypes)
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Tipo de email',
  })
  emailType: string;

  @OneToMany(
    type => Event,
    event => event.model,
  )
  events: Promise<Event[]>;
}

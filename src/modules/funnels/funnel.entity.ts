import {
  Entity,
  Column,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  ManyToOne,
} from 'typeorm';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Lead } from '../leads/lead.entity';
import { SourcedLead } from '../leads/sourcedLead.entity';

import { CrudValidationGroups } from '@nestjsx/crud';
import { Event } from 'modules/events/event.entity';

const { CREATE, UPDATE } = CrudValidationGroups;
export enum LeadTypes {
  FIRST_CONTACT = 'first_contact',
  LIVE_STORE = 'live_store',
}
const leadTypes = [LeadTypes.FIRST_CONTACT, LeadTypes.LIVE_STORE];
@Entity({
  name: 'funnels',
})
export class Funnel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => Lead,
    lead => lead.funnels,
  )
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ManyToOne(
    type => SourcedLead,
    sourcedLead => sourcedLead.funnels,
  )
  @JoinColumn({ name: 'sourcedLeadId' })
  sourcedLead: SourcedLead;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  clickOnWhatsapp: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha Click Whatsapp',
  })
  clickOnWhatsappDate: Date;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  clickOnCallUs: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha Click LLamanos',
  })
  clickOnCallUsDate: Date;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  clickOnFindUs: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha Click Find Us',
  })
  clickOnFindUsDate: Date;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  clickOnHeader: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha Click Imagen principal',
  })
  clickOnHeaderDate: Date;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  clickOnModel: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha Click Modelo',
  })
  clickOnModelDate: Date;

  @Column({ length: 40, nullable: true })
  @Index('IDX_leads_opportunity_name')
  opportunityName: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @MaxLength(50, { always: true })
  @IsIn(leadTypes)
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Tipo de email',
  })
  emailType: string;

  @IsOptional({ always: true })
  @Column({ type: 'timestamp', nullable: true })
  inxaitDownloadAt: Date;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  sms: boolean;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  email: boolean;

  @IsOptional({ always: true })
  @Column({ type: 'timestamp', nullable: true })
  sendDate: Date;

  @IsOptional({ always: true })
  @Column({ type: 'timestamp', nullable: true })
  openDate: Date;

  @IsOptional({ always: true })
  @Column({ type: 'timestamp', nullable: true })
  clickDate: Date;

  @IsOptional({ always: true })
  @Column({ type: 'timestamp', nullable: true })
  bouncedDate: Date;

  @OneToMany(
    type => Event,
    event => event.funnel,
  )
  events: Event[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;
}

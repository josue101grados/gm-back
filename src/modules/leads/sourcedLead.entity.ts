import {
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Campaign } from '../campaigns/campaign.entity';
import { City } from '../cities/city.entity';
import { DealerDealership } from '../dealers/dealerDealership.entity';
import { Model } from '../models/model.entity';
import { Funnel } from 'modules/funnels/funnel.entity';

export enum LeadStatus {
  DISCARDED = 'DESCARTADO',
  UPLOADED = 'CARGADO',
  CLEAN = 'CLEAN',
  SIEBEL = 'SIEBEL',
}

export enum LeadSources {
  FACEBOOK = 'FACEBOOK',
  DDP_FACEBOOK = 'DDP_FACEBOOK',
  RRSS = 'RRSS',
  CALL_CENTER = 'CALL_CENTER',
  GENERIC = 'GENERIC',
}

@Entity({
  name: 'sourced_leads',
})
export class SourcedLead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  campaignName: string;

  @ManyToOne(
    type => Campaign,
    campaign => campaign.leads,
  )
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column({ length: 6, nullable: true })
  bac: string;

  @Column({ length: 255 })
  dealerDealershipName: string;

  @ManyToOne(
    type => DealerDealership,
    dealerDealership => dealerDealership.leads,
  )
  @JoinColumn({ name: 'dealerDealershipId' })
  dealerDealership: DealerDealership;

  @Column({ length: 255, nullable: true })
  @Index('IDX_leads_model')
  modelName: string;

  @ManyToOne(
    type => Model,
    model => model.leads,
  )
  @JoinColumn({ name: 'modelId' })
  model: Model;

  @Column({ length: 255, comment: 'Documento' })
  @Index('IDX_leads_document')
  document: string;

  @Column({
    type: 'timestamp',
    comment: 'Fecha Carga API Fuentes',
    nullable: true,
  })
  @Index('IDX_leads_date')
  date: Date;

  @Column({ length: 30, nullable: true })
  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.UPLOADED,
    nullable: false,
    comment: 'Estado del Lead',
  })
  status: LeadStatus;

  @Column('boolean', { default: false })
  @Index('IDX_leads_duplicated')
  duplicated: boolean;

  @Column({ length: 255, nullable: true })
  @Index('IDX_leads_email')
  email: string;

  @Column({ length: 255, nullable: true })
  @Index('IDX_leads_source')
  source: string;

  @Column({ length: 50, nullable: true, comment: 'ID Externo' })
  @Index('IDX_leads_external_id')
  externalId: string;

  @Column({ length: 255, nullable: true, comment: 'Nombres' })
  names: string;

  @Column({ length: 255, nullable: true, comment: 'Apellidos' })
  lastNames: string;

  @Column({ length: 255, nullable: true, comment: 'Nombre1' })
  name1: string;

  @Column({ length: 255, nullable: true, comment: 'Nombre2' })
  name2: string;

  @Column({ length: 255, nullable: true, comment: 'Apellido1' })
  lastName1: string;

  @Column({ length: 255, nullable: true, comment: 'Apellido2' })
  lastName2: string;

  @Column({ length: 20, nullable: true, comment: 'Género' })
  gender: string;

  @Column({ length: 20, nullable: true, comment: 'Teléfono' })
  phone: string;

  @Column({ length: 20, nullable: true, comment: 'Teléfono del trabajo' })
  workPhone: string;

  @Column({ length: 20, nullable: true, comment: 'Celular' })
  mobile: string;

  @Column({ length: 255, nullable: true, comment: 'Ciudad' })
  cityName: string;

  @ManyToOne(
    type => City,
    city => city.leads,
  )
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column({ length: 20, nullable: true, comment: 'Observaciones' })
  observation: string;

  @Column({ length: 255, nullable: true })
  conadis: string;

  @Column({ length: 255, nullable: true })
  estimatedPurchaseDate: string;

  @Column({ length: 255, nullable: true })
  normalizedEstimatedPurchaseDate: string;

  @Column({ type: 'text', nullable: true, comment: 'Comentarios de Fuente' })
  otherComments: string;

  @Column({ length: 255, nullable: true, comment: 'Nombre Formulario' })
  externalFormName: string;

  @Column({
    length: 255,
    nullable: true,
    comment: 'Nº de Identificación del Vehículo',
  })
  vin: string;

  @Column({ length: 255, nullable: true, comment: 'Vin Válido' })
  vinIsValid: string;

  @Column('boolean', { default: false })
  validateSelfCampaignDuplicates: boolean;

  @Column('boolean', { default: null, nullable: true })
  dealerDealershipIsValid: boolean;

  @Column('boolean', { default: null, nullable: true })
  dealerDealershipCityIsValid: boolean;

  @Column('boolean', { default: null, nullable: true })
  documentIsValid: boolean;

  @Column('boolean', { default: null, nullable: true })
  emailIsValid: boolean;

  @Column({ length: 255, nullable: true })
  invalidEmailReason: string;

  @Column('boolean', { default: null, nullable: true })
  phoneIsValid: boolean;

  @Column('boolean', { default: null, nullable: true })
  nameIsValid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  duplicatedDownloadAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finalDownloadAt: Date;

  @OneToMany(
    type => Funnel,
    funnel => funnel.sourcedLead,
  )
  funnels: Funnel[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Timestamp;
}

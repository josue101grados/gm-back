import {
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

import { Campaign } from '../campaigns/campaign.entity';
import { City } from '../cities/city.entity';
import { DealerDealership } from '../dealers/dealerDealership.entity';
import { Model } from '../models/model.entity';
import { Sale } from '../sales/sale.entity';
import { Funnel } from 'modules/funnels/funnel.entity';
import { LiveStore } from '../liveStore/liveStore.entity';

export enum LeadStatus {
  DISCARDED = 'DESCARTADO',
  UPLOADED = 'CARGADO',
  SIEBEL = 'SIEBEL',
}

@Entity({
  name: 'leads',
})
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 40, nullable: true })
  @Index('IDX_leads_opportunity_name')
  opportunityName: string;

  @Column({ length: 255 })
  campaignName: string;

  @ManyToOne(
    type => Campaign,
    campaign => campaign.leads,
  )
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column({ length: 6 })
  bac: string;

  @Column({ length: 255 })
  dealerDealershipName: string;

  @ManyToOne(
    type => DealerDealership,
    dealerDealership => dealerDealership.leads,
  )
  @JoinColumn({ name: 'dealerDealershipId' })
  dealerDealership: DealerDealership;

  @Column({ length: 255 })
  @Index('IDX_leads_model')
  modelName: string;

  @ManyToOne(
    type => Model,
    model => model.leads,
  )
  @JoinColumn({ name: 'modelId' })
  model: Model;

  @Column({ length: 255, nullable: true, comment: 'Documento' })
  @Index('IDX_leads_document')
  document: string;

  @Column({
    type: 'timestamp',
    comment: 'Fecha Carga API Fuentes',
    nullable: true,
  })
  @Index('IDX_leads_date')
  date: Date;

  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de creación' })
  @Index('IDX_leads_creation_date')
  creationDate: Date;

  @Column({ length: 30, nullable: true })
  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.UPLOADED,
    nullable: false,
    comment: 'Estado del Lead',
  })
  status: LeadStatus;

  @Column('boolean', { default: true })
  isValid: boolean;

  @Column('boolean', { default: false })
  @Index('IDX_leads_duplicated')
  duplicated: boolean;

  @ManyToOne(
    type => Lead,
    parent => parent.childs,
  )
  @JoinColumn({ name: 'parentId' })
  parent: Lead;

  @OneToMany(
    type => Lead,
    child => child.parent,
  )
  childs: Promise<Lead[]>;

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

  @Column({ type: 'timestamp', nullable: true })
  saleStageDate: Date;

  @Column({ length: 255, nullable: true, comment: 'Etapa de venta' })
  @Index('IDX_leads_sale_stage')
  saleStage: string;

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

  @Column('boolean', { default: null, nullable: true })
  isOverall: boolean;

  @Column('boolean', { default: null, nullable: true })
  isSaleOverall: boolean;

  @Column('boolean', { default: null, nullable: true })
  isFranchiseLead: boolean;

  @Column('boolean', { default: null, nullable: true })
  isFiltered: boolean;

  @Column('boolean', { default: null, nullable: true })
  isFilteredSale: boolean;

  @Column('boolean', { default: null, nullable: true })
  isDerived: boolean;

  @Column('boolean', { default: null, nullable: true })
  isDerivedSale: boolean;

  @Column('boolean', { default: null, nullable: true })
  isContactabilityAudited: boolean;

  @Column('boolean', { default: null, nullable: true })
  isPacLead: boolean;

  @Column('boolean', { default: null, nullable: true })
  isPacSale: boolean;

  @Column('boolean', { default: null, nullable: true })
  isLiveStoreLead: boolean;

  @Column('boolean', { default: null, nullable: true })
  isLiveStoreSale: boolean;

  @Column('boolean', { default: null, nullable: true })
  isDocumentNull: boolean;

  @Column('boolean', { default: null, nullable: true })
  isTruckOrBus: boolean;

  @Column('boolean', { default: null, nullable: true })
  isOnExcludedCampaigns: boolean;

  @Column({ type: 'varchar', length: 2, nullable: true })
  instanceSlug: string;

  @Column({ type: 'text', nullable: true, comment: 'Comentarios del Cliente' })
  rawClientComment: string;

  @Column({ type: 'boolean', nullable: true })
  isNewVehicleSale: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Timestamp;

  @OneToMany(
    type => Sale,
    sale => sale.lead,
  )
  sales: Sale[];

  @OneToMany(
    type => Sale,
    overallSale => overallSale.overallLead,
  )
  overallSales: Sale[];

  @OneToMany(
    type => Funnel,
    funnel => funnel.lead,
  )
  funnels: Funnel[];

  @OneToOne(
    () => LiveStore,
    liveStore => liveStore.lead,
  )
  liveStore: LiveStore;
}

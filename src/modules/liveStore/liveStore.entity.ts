import {
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Lead } from '../leads/lead.entity';
import { User } from '../users/user.entity';
import { Adviser } from './advisers/adviser.entity';
import { TemporalLead } from './temporalLeads/temporalLead.entity';

export enum NotInterestedReason {
  EXPENSIVE = 'COSTOSO',
  JUST_QUOTING = 'SOLO ESTABA COTIZANDO',
  WANT_ANOTHER_BRAND = 'QUIERE COMPRAR OTRA MARCA',
  USED_VEHICLE = 'VEHICULO USADO',
  FUTURE_PURCHASE = 'COMPRA A FUTURO',
  NO_PROFILE_NO_APPLY = 'NO TIENE PERFIL O NO APLICA',
  WANT_ANOTHER_FE = 'QUIERE OTRA ENTIDAD FINANCIERA',
  ANOTHER_PAYMENT_METHOD = 'OTRO METODO DE PAGO',
}

export enum Status {
  IN_PROCESS = 'EN SEGUIMIENTO',
  QUOTE_SENT = 'COTIZACION ENVIADA',
  SCHEDULED_A_VISIT_DEALER = 'PROGRAMO VISITA AL DEALER',
  DESIST_OF_PURCHASE = 'DESISTE DE LA COMPRA',
  POST_PURCHASE = 'POSTERGA LA COMPRA',
  NOT_ANSWER = 'NO CONTESTA',
}

export enum ClientType {
  DEPENDANT = 'Dependiente',
  INDEPENDANT = 'Independiente',
  POLICE = 'FFAA / Policial',
}

export enum Version {
  PREMIER = 'Premier',
  ENTRANT = 'Entrada',
  INTERMEDIATE = 'Intermedia',
  INTERMEDIATE_AT = 'Intermedia AT',
  INTERMEDIATE_AT_MT = 'Intermedia AT y MT',
  DIESEL = 'Diesel',
}

export enum MaritalStatus {
  SINGLE = 'Soltero',
  MARRIED_GOOD = 'Casado Bien',
  MARRIED_SEPARATED = 'Casado Separado',
  WIDOWER = 'Viudo',
  DIVORCED = 'Divorciado',
}

@Entity('live_store')
export class LiveStore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  managementDate: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isInterested: boolean;

  @Column({
    type: 'enum',
    enum: NotInterestedReason,
    nullable: true,
  })
  notInterestedReason: NotInterestedReason;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
  })
  virtualExperience: boolean;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  virtualExperienceDate: Date;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  dealerManagementDate: Date;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  callAttempt: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  effectiveContact: boolean;

  @Column({
    type: 'enum',
    enum: Status,
    nullable: true,
  })
  status: Status;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  financing: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  isInterestedInFinancing: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  chosenModel: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  serieRUT: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  birthDate: Date;

  @Column({
    type: 'enum',
    enum: MaritalStatus,
    nullable: true,
  })
  maritalStatus: MaritalStatus;

  @Column({
    type: 'enum',
    enum: ClientType,
    nullable: true,
  })
  clientType: ClientType;

  @Column({
    type: 'int',
    nullable: true,
  })
  yearsOnCurrentJob: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  monthsOnCurrentJob: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  monthlyIncome: number;

  @Column({
    type: 'enum',
    enum: Version,
    nullable: true,
  })
  version: Version;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Pie ($/%)',
  })
  threshold: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  plan: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  deadline: string;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  preapprovedCredit: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  notVirtualExperienceReason: string;

  @ManyToOne(
    () => Adviser,
    adviser => adviser.liveStores,
  )
  @JoinColumn({ name: 'adviserId' })
  adviser: Adviser;

  @OneToOne(
    () => Lead,
    lead => lead.liveStore,
  )
  @JoinColumn({
    name: 'lead_id',
  })
  lead: Lead;

  @OneToOne(
    () => TemporalLead,
    lead => lead.liveStore,
  )
  @JoinColumn({
    name: 'temporal_lead_id',
  })
  temporalLead: TemporalLead;

  @ManyToOne(
    () => User,
    user => user.liveStores,
  )
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

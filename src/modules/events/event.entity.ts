import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsDecimal,
} from 'class-validator';
import { CrudValidationGroups } from '@nestjsx/crud';
import { Model } from 'modules/models/model.entity';
import { Funnel } from 'modules/funnels/funnel.entity';

export enum EventStatus {
  ACTIVE = 'ACTIVO',
  CONFIRMED = 'CONFIRMADA',
  CANCELLED = 'CANCELADO',
  EXPIRED = 'CADUCADO',
  COMPLETED = 'COMPLETADO',
}

export enum EstimatedPurchaseDate {
  ONE_MONTH = '1 MES',
  TWO_MONTHS = '2 MESES',
  THREE_MONTHS = '3 MESES',
  MORE_THAN_THREE_MONTHS = '> 3 MESES',
  LESS_THAN_THREE_MONTHS = 'MENOR A 3 MESES',
  OTHERS = 'OTROS',
}

export enum EventType {
  APPOINTMENT = 'CITA',
  EXCEPTION = 'EXCEPCION',
}

export enum EventSaleStatus {
  NOT_CONTACTED = 'NO CONTACTADO',
  NOT_INTERESTED = 'NO INTERESADO',
  ASSIGNED_SELLER = 'ASIGNADO A VENDEDOR',
}

export enum NotInterestedReason {
  DESIST_OF_THE_PURCHASE = 'DESISTE DE LA COMPRA',
  BOUGHT_ANOTHER_BRAND = 'COMPRO OTRA MARCA',
  DOES_NOT_MEET_PROFILE = 'NO CUMPLE PERFIL',
  INTERESTED_IN_USED = 'INTERESADO EN USADO',
  CHEVYPLAN = 'CHEVYPLAN',
  OTHERS = 'OTROS',
}

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'events',
})
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ groups: [CREATE] })
  @Column({ type: 'int' })
  userId: number;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @Column({ type: 'varchar', length: 255, nullable: true })
  userFullName: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.APPOINTMENT,
    nullable: false,
    comment: 'Tipo de Evento',
  })
  type: EventType;

  @Column({ length: 255, nullable: true })
  exceptionReason: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.ACTIVE,
    nullable: false,
    comment: 'Estado del evento',
  })
  status: EventStatus;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'datetime', nullable: true })
  requestedDate: Date;

  @ManyToOne(
    type => Model,
    model => model.events,
  )
  @JoinColumn({ name: 'modelId' })
  model: Model;

  @Column({ length: 255, nullable: true })
  cancellationReason: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({
    type: 'enum',
    enum: EstimatedPurchaseDate,
    default: EstimatedPurchaseDate.ONE_MONTH,
    nullable: false,
    comment: 'Fecha Estimada de Compra',
  })
  estimatedPurchaseDate: EstimatedPurchaseDate;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  requiresFinancing: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  firstVehicle: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  hasAnotherChevrolet: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  otherBrandConsidering: boolean;

  @Column({ length: 140, nullable: true })
  comments: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  appointmentFulfilled: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  derived: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  quoteAsked: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  creditRequested: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  creditApproved: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  purchasePostponed: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  reservation: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  differentIdSale: boolean;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsBoolean({ always: true })
  @Column('boolean', { default: false })
  billed: boolean;

  @Column({ type: 'int', nullable: true })
  timesReagent: number;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({
    type: 'enum',
    enum: EventSaleStatus,
    default: EventSaleStatus.NOT_CONTACTED,
    nullable: false,
    comment: 'Estado de la venta',
  })
  saleStatus: EventSaleStatus;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsDecimal()
  @Column('numeric', { precision: 12, scale: 2 })
  moneyToBuy: number;

  @Column({ length: 255, nullable: true })
  sellerName: string;

  @Column({ length: 255, nullable: true })
  sellerLastName: string;

  @Column({
    type: 'enum',
    enum: NotInterestedReason,
    nullable: true,
    comment: 'Razón por la que no está interesado',
  })
  notInterestedReason: NotInterestedReason;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @ManyToOne(
    type => Funnel,
    funnel => funnel.events,
  )
  @JoinColumn({ name: 'funnelId' })
  funnel: Funnel;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;
}

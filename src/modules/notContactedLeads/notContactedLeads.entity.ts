import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  PrimaryColumn,
} from 'typeorm';
import { NotContactedLeadsAttachments } from './attachments/attachments.entity';

export enum ValidationStatus {
  PENDING = 'PENDIENTE',
  APPROVED = 'APROBADO',
  DENIED = 'NEGADO',
}

export enum JustificationObservation {
  REASON_1 = 'No envía justificación',
  REASON_2 = 'Contacto posterior a la encuesta',
  REASON_3 = 'Evidencia no demuestra contacto',
  REASON_4 = 'Evidencia no corresponde al lead',
  REASON_5 = 'No indica a quien pertenece el lead',
  REASON_6 = 'No hay comunicación bidireccional',
  REASON_7 = 'No se observa fecha de contacto',
}

@Entity({
  name: 'not_contacted_leads',
})
export class NotContactedLeads {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column({ length: 6 })
  bac: string;

  @Column({
    comment: 'Dealer Group al que pertenece este lead no contactado',
    nullable: false,
  })
  dealerGroupId: number;

  @PrimaryColumn({ length: 40, nullable: false })
  opportunityName: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha última de gestión',
  })
  lastManagementDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Hora última de gestión',
  })
  lastManagementHour: Date;

  @Column({
    comment:
      '¿Qué tan satisfecho se encuentra con la atención recibida por el concesionario? Siendo 0 nada',
    nullable: true,
  })
  satisfactionLevel: number;

  @Column({ length: 50, nullable: true, comment: 'Medio de contacto' })
  means: string;

  @Column({
    comment: '¿En cuánto tiempo fue contactado?',
    nullable: true,
    length: 255,
  })
  timeToTakeContact: string;

  @Column('boolean', {
    nullable: true,
    default: null,
    comment:
      '¿Desea ser contactado por otro concesionario, para seguir su proceso de compra?',
  })
  wantAnotherDealer: boolean;

  @Column({
    length: 255,
    nullable: true,
    comment:
      'Si no desea ser contactado por otro concesionario, entonces ¿Cuál es la razón?',
  })
  notContactedReason: string;

  @Column('boolean', {
    nullable: true,
    default: null,
    comment: '¿El cliente quiso no ser contactado?',
  })
  notContacted: boolean;

  @Column({
    comment: 'Días de diferencia',
    nullable: true,
    default: 0,
  })
  daysApart: number;

  @Column({
    length: 255,
    nullable: true,
    default: null,
  })
  observations: string;

  @Column({
    type: 'enum',
    enum: ValidationStatus,
    nullable: true,
    comment: 'Estado del Lead No Contactado',
  })
  status: ValidationStatus;

  @Column({
    type: 'timestamp',
    comment: 'Fecha en la que se justificó',
    nullable: true,
    default: null,
  })
  justificationDate: Date;

  @Column({
    type: 'enum',
    enum: JustificationObservation,
    nullable: true,
    comment: 'Observación de la respuesta a la justificación',
  })
  justificationObservation: JustificationObservation;

  @Column({
    comment: 'Número de tarea con el cual fue cargada esta información',
    nullable: false,
  })
  taskId: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  keyWord: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @OneToMany(
    type => NotContactedLeadsAttachments,
    attachment => attachment.opportunityName,
    { primary: true },
  )
  attachment: NotContactedLeadsAttachments[];
}

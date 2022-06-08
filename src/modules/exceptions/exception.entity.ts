import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
} from 'typeorm';

import { Model } from '../models/model.entity';

@Entity({
  name: 'exceptions',
})
export class Exception {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 40,
    nullable: false,
  })
  opportunityName: string;

  @Column({
    length: 50,
    nullable: true,
  })
  campaignName: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de Creación (Mayúscula)',
  })
  derivationDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de creación (Minúscula)',
  })
  siebelDate: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    comment: 'fechaDerivación >= fechaSiebel',
  })
  isValid: boolean;

  @Column({ length: 255, nullable: true })
  estimatedPurchaseDate: string;

  @Column({ length: 255, nullable: true })
  normalizedEstimatedPurchaseDate: string;

  @Column('boolean', { nullable: true, default: null })
  isFiltered: boolean;

  @Column({ length: 255, nullable: true, comment: 'Documento' })
  document: string;

  @Column({ length: 255, nullable: true, comment: 'Nombres' })
  names: string;

  @Column({ length: 255, nullable: true, comment: 'Apellidos' })
  lastNames: string;

  @Column({ length: 20, nullable: true, comment: 'Celular' })
  mobile: string;

  @Column({ length: 20, nullable: true, comment: 'Teléfono' })
  phone: string;

  @Column({ length: 20, nullable: true, comment: 'Teléfono del trabajo' })
  workPhone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @ManyToOne(
    type => Model,
    model => model.exeptions,
  )
  @JoinColumn({ name: 'modelId' })
  model: Model;
}

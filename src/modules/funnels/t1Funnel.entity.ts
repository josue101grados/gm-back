import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DealerGroup } from 'modules/dealers/dealerGroup.entity';
import { IsNotEmpty, Min, Max } from 'class-validator';
import { CrudValidationGroups } from '@nestjsx/crud';
import { CreditProviders, PaymentTypes } from './common/payments';

const { CREATE } = CrudValidationGroups;

@Entity({
  name: 'T1Funnels',
})
@Index(['year', 'month', 'dealer'], { unique: true })
export class T1Funnel {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ groups: [CREATE] })
  @Min(2000)
  @Column({
    type: 'int',
    nullable: false,
    comment: 'Year this record belongs to. Eg. 2020',
  })
  year: number;

  @IsNotEmpty({ groups: [CREATE] })
  @Min(1)
  @Max(12)
  @Column({
    type: 'int',
    nullable: false,
    comment: 'Number of the month this record belongs to. Eg. 1 for January',
  })
  month: number;

  @IsNotEmpty({ groups: [CREATE] })
  @ManyToOne(
    type => DealerGroup,
    dealerGroup => dealerGroup.t1Funnels,
  )
  dealer: DealerGroup;

  @Column({
    type: 'int',
    comment: 'Contactabilidad',
    default: 0,
  })
  contacts: number;

  @Column({
    type: 'int',
    comment: 'Interesados',
    default: 0,
  })
  interested: number;

  @Column({
    type: 'int',
    comment: 'Cotización',
    default: 0,
  })
  quoteAsked: number;

  @Column({
    type: 'json',
    comment: 'Solicitudes de crédito',
  })
  creditRequests: CreditProviders;

  @Column({
    type: 'json',
    comment: 'Solicitudes de crédito rechazadas',
  })
  creditRejections: CreditProviders;

  @Column({
    type: 'json',
    comment: 'Aprobaciones de crédito',
  })
  creditApprovals: CreditProviders;

  @Column({ type: 'int', comment: 'Interesados en pagos de contado' })
  interestedOnCashPayment: number;

  @Column({ type: 'int', comment: 'Bajo seguimiento Método de Pago' })
  paymentPostponed: number;

  @Column({ type: 'int', comment: 'Ventas con id Diferente' })
  diffrentIdSales: number;

  @Column({
    type: 'json',
    comment: 'Reservas',
  })
  reservations: PaymentTypes;

  @Column({ type: 'json', comment: 'Facturados' })
  billed: PaymentTypes;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

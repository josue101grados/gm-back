import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { DealerDealership } from '../dealers/dealerDealership.entity';
import { User } from '../users/user.entity';

@Entity({
  name: 'inxait_recovery_emails',
})
export class InxaitRecoveryEmail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, comment: 'Concesionario' })
  dealerDealershipName: string;

  @ManyToOne(
    type => DealerDealership,
    dealerDealership => dealerDealership.inxaitRecoveryEmails,
  )
  @JoinColumn({ name: 'dealerDealershipId' })
  dealerDealership: DealerDealership;

  @Column({ length: 255, comment: 'Documento' })
  document: string;

  @Column({ length: 255, comment: 'Nombre' })
  name: string;

  @Column({ length: 255, comment: 'Apellidos' })
  lastName: string;

  @Column({ length: 255, nullable: true, comment: 'Correo electrónico' })
  email: string;

  @ManyToOne(
    type => User,
    user => user.inxaitRecoveryEmails,
  )
  @JoinColumn({ name: 'userId' })
  responsible: User;

  @CreateDateColumn({ type: 'timestamp', comment: 'Fecha de Creación' })
  createdAt: Timestamp;

  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha Envío Email' })
  emailSendAt: Timestamp;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Fecha de Modificación',
  })
  modifiedAt: Timestamp;

  @Column({ type: 'timestamp', nullable: true, comment: 'Fecha de Descarga' })
  downloadedAt: Timestamp;
}

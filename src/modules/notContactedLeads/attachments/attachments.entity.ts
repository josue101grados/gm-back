import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  NotContactedLeads,
  ValidationStatus,
  JustificationObservation,
} from '../notContactedLeads.entity';

@Entity({
  name: 'not_contacted_leads_attachments',
})
export class NotContactedLeadsAttachments {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => NotContactedLeads,
    notContactedLead => notContactedLead.attachment,
    { primary: true },
  )
  @JoinColumn({ name: 'opportunityName' })
  opportunityName: NotContactedLeads;

  @Column({
    type: 'varchar',
    length: 1200,
    nullable: true,
    comment: 'Url del Archivo Cargado',
  })
  filePath: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'Nombre de archivo',
  })
  fileName: string;

  @Column({
    type: 'enum',
    enum: ValidationStatus,
    nullable: true,
    comment: 'Estado del Lead No Contactado',
  })
  status: ValidationStatus;

  @Column({
    type: 'enum',
    enum: JustificationObservation,
    nullable: true,
    comment: 'Observación de la respuesta a la justificación',
  })
  justificationObservation: JustificationObservation;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;
}

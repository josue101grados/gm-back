import {
  Entity,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { IsOptional, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { CrudValidationGroups } from '@nestjsx/crud';
import { DealerGroup } from '../dealers/dealerGroup.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'announcements',
})
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @IsOptional({ always: true })
  @IsString({ always: true })
  @Column({ type: 'text', nullable: true, default: null })
  description: string;

  @ManyToOne(
    type => DealerGroup,
    dealerGroup => dealerGroup.announcements,
  )
  @JoinColumn({ name: 'dealerGroupId' })
  dealerGroup: DealerGroup;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, comment: 'Imagen' })
  image: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @Column({
    type: 'enum',
    enum: ['ACTIVO', 'INACTIVO'],
    comment: 'Estado',
  })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;
}

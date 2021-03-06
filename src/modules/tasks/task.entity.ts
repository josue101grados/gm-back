import {
  Entity,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { CrudValidationGroups } from '@nestjsx/crud';
import { User } from '../users/user.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

export enum TaskStatus {
  PENDING = 'PENDIENTE',
  IN_PROGESS = 'EJECUTANDO',
  COMPLETED = 'COMPLETADA',
}

export enum TaskTypes {
  DIRECTS_UPLOAD = 'carga_directas',
  SOURCES_UPLOAD = 'carga_fuentes',
  MONTHLY_CLOSURE_UPLOAD = 'carga_cierre_mes',
  SALES_UPLOAD = 'carga_ventas',
  GENERATE_REPORT = 'generar_reporte',
  FUNNEL_UPLOAD = 'carga_funnels',
  CONTACTABILITY_UPLOAD = 'carga_contactabilidad',
  LIVE_STORE_UPLOAD = 'carga_live_store',
}

const taskTypes = [
  TaskTypes.DIRECTS_UPLOAD,
  TaskTypes.SOURCES_UPLOAD,
  TaskTypes.MONTHLY_CLOSURE_UPLOAD,
  TaskTypes.SALES_UPLOAD,
  TaskTypes.GENERATE_REPORT,
  TaskTypes.FUNNEL_UPLOAD,
];

@Entity({
  name: 'tasks',
})
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(50, { always: true })
  @IsIn(taskTypes)
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: 'Tipo de Tarea',
  })
  type: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    nullable: false,
    comment: 'Estado de Tarea',
  })
  status: TaskStatus;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Url del Archivo Cargado',
  })
  filePath: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @MaxLength(1200, { always: true })
  @Column({
    type: 'varchar',
    length: 1200,
    nullable: true,
    comment: 'Url del Archivo de Errores',
  })
  errorsFilePath: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @Column({
    type: 'json',
    nullable: true,
    comment: 'Datos Adicionales de Carga',
  })
  data: any;

  @Column({
    type: 'int',
    nullable: true,
    comment:
      'Ayuda a saber a qu?? n??mero de instancia/servidor corresponde cada uno',
  })
  instanceNumber: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @ManyToOne(
    type => User,
    user => user.tasks,
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;
}

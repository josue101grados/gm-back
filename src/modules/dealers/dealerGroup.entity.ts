import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { IsOptional, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { DealerCity } from './dealerCity.entity';
import { Announcement } from '../announcements/announcement.entity';
import { CrudValidationGroups } from '@nestjsx/crud';
import { GeneratedReport } from 'modules/reports/generatedReports.entity';
import { User } from 'modules/users/user.entity';
import { T1Funnel } from 'modules/funnels/t1Funnel.entity';
import { Adviser } from '../liveStore/advisers/adviser.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity({
  name: 'dealer_groups',
})
export class DealerGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, comment: 'Agrupación' })
  @Index('IDX_dealer_groups_name', { unique: true })
  name: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @MaxLength(255, { always: true })
  @Column({
    type: 'varchar',
    length: 255,
    comment:
      'Link de derivación. Este link se muestra cuando una cita ha sido derivada',
    nullable: true,
  })
  derivedLink: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @Column({
    type: 'boolean',
    comment: 'Si se ignora para los reportes de Funnels',
    default: false,
  })
  ignoreOnFunnels: boolean;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Times the dealer press "Guardar" when edit Resumen Funnel',
  })
  editionCounter: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Timestamp;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Timestamp;

  @OneToMany(
    type => DealerCity,
    DealerCity => DealerCity.dealerGroup,
  )
  dealerCities: Promise<DealerCity[]>;

  @OneToMany(
    type => Announcement,
    announcement => announcement.dealerGroup,
  )
  announcements: Promise<Announcement[]>;

  @OneToMany(
    type => GeneratedReport,
    generatedReport => generatedReport.dealerGroup,
  )
  generatedReports: Promise<GeneratedReport[]>;

  @OneToMany(
    type => User,
    user => user.dealerGroup,
  )
  users: User[];

  @OneToMany(
    type => T1Funnel,
    t1Funnel => t1Funnel.dealer,
  )
  t1Funnels: T1Funnel[];

  @OneToMany(
    () => Adviser,
    adviser => adviser.dealerGroup,
  )
  advisers: Adviser[];
}

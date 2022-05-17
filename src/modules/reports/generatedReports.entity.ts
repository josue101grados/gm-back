import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DealerGroup } from 'modules/dealers/dealerGroup.entity';

@Entity({
  name: 'generated_reports',
})
export class GeneratedReport {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => DealerGroup,
    dealerGroup => dealerGroup.generatedReports,
  )
  @JoinColumn({ name: 'dealerGroupId' })
  dealerGroup: DealerGroup;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @Column({ length: 50, nullable: true })
  report: string;

  @Column({ length: 255, nullable: true })
  path: string;
}

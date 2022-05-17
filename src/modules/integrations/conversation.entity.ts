import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({
  name: 'conversations',
})
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  @Index('IDX_conversations_conversationId', { unique: true })
  conversationId: number;

  @Column({ length: 255, nullable: true })
  tags: string;

  @Column({ type: 'time', nullable: true })
  date: Date;

  @Column({ length: 255, nullable: true })
  duration: string;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ length: 255, nullable: true })
  userHash: string;

  @Column({ length: 255, nullable: true })
  userName: string;

  @Column({ length: 255, nullable: true })
  userMail: string;

  @Column({ type: 'int', nullable: true })
  interactionsTotal: number;

  @Column({ type: 'boolean', nullable: true })
  interactionsFeedback: boolean;

  @Column({ type: 'int', nullable: true })
  resolutionId: number;

  @Column({ length: 255, nullable: true })
  resolutionName: string;

  @Column({ length: 255, nullable: true })
  locationCountry: string;

  @Column({ length: 255, nullable: true })
  locationRegion: string;

  @Column({ length: 255, nullable: true })
  locationCity: string;
  sourceChannelId: number;

  @Column({ length: 255, nullable: true })
  sourceChannelName: string;

  @Column({ type: 'int', nullable: true })
  sourceMediaId: number;

  @Column({ length: 255, nullable: true })
  sourceMediaName: string;

  @Column({ length: 255, nullable: true })
  sourceCondition: string;

  @Column({ length: 255, nullable: true })
  sourceUrl: string;

  @Column({ length: 255, nullable: true })
  device: string;

  @Column({ type: 'boolean', nullable: true })
  surveyAnswered: boolean;

  @Column({ length: 255, nullable: true })
  surveyType: string;

  @Column({ length: 255, nullable: true })
  surveyValuation: string;

  @Column({ length: 255, nullable: true })
  surveyValue: string;
}

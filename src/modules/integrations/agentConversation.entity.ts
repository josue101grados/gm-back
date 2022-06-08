import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({
  name: 'agents_conversations',
})
export class AgentConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  @Index('IDX_leads_opportunity_name', { unique: true })
  conversationId: number;

  @Column({ type: 'int', nullable: true })
  botId: number;

  @Column({ type: 'timestamp', nullable: true })
  queueddatetime: Date;

  @Column({ type: 'timestamp', nullable: true })
  startdatetime: Date;

  @Column({ type: 'timestamp', nullable: true })
  enddatetime: Date;

  @Column({ type: 'time', nullable: true })
  sessionTime: Date;

  @Column({ type: 'time', nullable: true })
  waitTime: Date;

  @Column({ type: 'int', nullable: true })
  groupId: number;

  @Column({ length: 255, nullable: true })
  groupName: string;

  @Column({ length: 255, nullable: true })
  groupDescription: string;

  @Column({ type: 'int', nullable: true })
  protocolId: number;

  @Column({ length: 255, nullable: true })
  protocolName: string;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ length: 255, nullable: true })
  userFirstName: string;

  @Column({ length: 255, nullable: true })
  userLastName: string;

  @Column({ length: 255, nullable: true })
  userPhone: string;

  @Column({ type: 'timestamp', nullable: true })
  userCreatedAt: Date;

  @Column({ length: 255, nullable: true })
  userExtraInformation: string;

  @Column({ type: 'int', nullable: true })
  agentId: number;

  @Column({ length: 255, nullable: true })
  agentName: string;

  @Column({ length: 255, nullable: true })
  agentNickName: string;

  @Column({ length: 255, nullable: true })
  agentEmail: string;

  @Column({ length: 255, nullable: true })
  agentPicture: string;

  @Column({ type: 'int', nullable: true })
  reasonId: number;

  @Column({ length: 255, nullable: true })
  reasonDescription: string;

  @Column({ type: 'int', nullable: true })
  feedbackId: number;

  @Column({ length: 255, nullable: true })
  feedbackName: string;

  @Column({ length: 255, nullable: true })
  feedbackValue: string;

  @Column({ type: 'int', nullable: true })
  closedById: number;

  @Column({ length: 255, nullable: true })
  closedByName: string;

  @Column({ type: 'int', nullable: true })
  locationId: number;

  @Column({ length: 255, nullable: true })
  locationCity: string;

  @Column({ length: 255, nullable: true })
  locationCountry: string;

  @Column({ length: 255, nullable: true })
  locationIp: string;

  @Column({ type: 'int', nullable: true })
  platformId: number;

  @Column({ length: 255, nullable: true })
  platformName: string;

  @Column({ length: 255, nullable: true })
  platformVersion: string;

  @Column({ type: 'int', nullable: true })
  browserId: number;

  @Column({ length: 255, nullable: true })
  browserName: string;

  @Column({ length: 255, nullable: true })
  browserVersion: string;
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgentsConversationsTable1597892744198
  implements MigrationInterface {
  name = 'CreateAgentsConversationsTable1597892744198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE agents_conversations (
        id int NOT NULL AUTO_INCREMENT,
        conversationId int NOT NULL,
        botId int NULL,
        queueddatetime timestamp NULL,
        startdatetime timestamp NULL,
        enddatetime timestamp NULL,
        sessionTime time NULL,
        waitTime time NULL,
        groupId int NULL,
        groupName varchar(255) NULL,
        groupDescription varchar(255) NULL,
        protocolId int NULL,
        protocolName varchar(255) NULL,
        userId int NULL,
        userFirstName varchar(255) NULL,
        userLastName varchar(255) NULL,
        userPhone varchar(255) NULL,
        userCreatedAt timestamp NULL,
        userExtraInformation varchar(255) NULL,
        agentId int NULL,
        agentName varchar(255) NULL,
        agentNickName varchar(255) NULL,
        agentEmail varchar(255) NULL,
        agentPicture varchar(255) NULL,
        reasonId int NULL,
        reasonDescription varchar(255) NULL,
        feedbackId int NULL,
        feedbackName varchar(255) NULL,
        feedbackValue varchar(255) NULL,
        closedById int NULL,
        closedByName varchar(255) NULL,
        locationId int NULL,
        locationCity varchar(255) NULL,
        locationCountry varchar(255) NULL,
        locationIp varchar(255) NULL,
        platformId int NULL,
        platformName varchar(255) NULL,
        platformVersion varchar(255) NULL,
        browserId int NULL,
        browserName varchar(255) NULL,
        browserVersion varchar(255) NULL,
        UNIQUE INDEX IDX_leads_opportunity_name (conversationId),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE agents_conversations', undefined);
  }
}

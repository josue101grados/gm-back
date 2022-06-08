import { MigrationInterface, QueryRunner } from 'typeorm';

export class AivoConversationTable1602120973720 implements MigrationInterface {
  name = 'AivoConversationTable1602120973720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE conversations (
          id int NOT NULL AUTO_INCREMENT,
          conversationId int NOT NULL,
          tags varchar(255) NULL,
          date time NULL,
          duration varchar(255) NULL,
          userId int NULL,
          userHash varchar(255) NULL,
          userName varchar(255) NULL,
          userMail varchar(255) NULL,
          interactionsTotal int NULL,
          interactionsFeedback tinyint NULL,
          resolutionId int NULL,
          resolutionName varchar(255) NULL,
          locationCountry varchar(255) NULL,
          locationRegion varchar(255) NULL,
          locationCity varchar(255) NULL,
          sourceChannelName varchar(255) NULL,
          sourceMediaId int NULL,
          sourceMediaName varchar(255) NULL,
          sourceCondition varchar(255) NULL,
          sourceUrl varchar(255) NULL,
          device varchar(255) NULL,
          surveyAnswered tinyint NULL,
          surveyType varchar(255) NULL,
          surveyValuation varchar(255) NULL,
          surveyValue varchar(255) NULL,
          UNIQUE INDEX IDX_conversations_conversationId (conversationId),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IDX_conversations_conversationId ON conversations',
      undefined,
    );
    await queryRunner.query('DROP TABLE conversations', undefined);
  }
}

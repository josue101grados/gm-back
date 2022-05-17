import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeOfOtherCommentsOnLeadsAndSourcedLeadsTables1592426280822
  implements MigrationInterface {
  name = 'ChangeTypeOfOtherCommentsOnLeadsAndSourcedLeadsTables1592426280822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE leads CHANGE otherComments otherComments text NULL COMMENT 'Comentarios de Fuente'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads CHANGE otherComments otherComments text NULL COMMENT 'Comentarios de Fuente'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE leads CHANGE otherComments otherComments varchar(255) CHARACTER SET "utf8" COLLATE "utf8_general_ci" NULL COMMENT 'Comentarios de Fuente'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads CHANGE otherComments otherComments varchar(255) CHARACTER SET "utf8" COLLATE "utf8_general_ci" NULL COMMENT 'Comentarios de Fuente'`,
      undefined,
    );
  }
}

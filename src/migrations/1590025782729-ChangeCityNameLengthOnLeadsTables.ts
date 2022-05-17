import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCityNameLengthOnLeadsTables1590025782729
  implements MigrationInterface {
  name = 'ChangeCityNameLengthOnLeadsTables1590025782729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE leads CHANGE cityName cityName varchar(255) NULL COMMENT 'Ciudad'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads CHANGE cityName cityName varchar(255) NULL COMMENT 'Ciudad'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE sourced_leads CHANGE cityName cityName varchar(20) CHARACTER SET "utf8" COLLATE "utf8_general_ci" NULL COMMENT 'Ciudad'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads CHANGE cityName cityName varchar(20) CHARACTER SET "utf8" COLLATE "utf8_general_ci" NULL COMMENT 'Ciudad'`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeExternalIdLengthOnLeadsTable1589600655378
  implements MigrationInterface {
  name = 'ChangeExternalIdLengthOnLeadsTable1589600655378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE sourced_leads CHANGE externalId externalId VARCHAR(50)
      CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'ID Externo'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads CHANGE externalId externalId VARCHAR(50)
      CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'ID Externo'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE sourced_leads CHANGE externalId externalId VARCHAR(6)
      CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'ID Externo'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads CHANGE externalId externalId VARCHAR(6)
      CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'ID Externo'`,
      undefined,
    );
  }
}

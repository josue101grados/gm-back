import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsValidOverallToSalesTable1594244787285
  implements MigrationInterface {
  name = 'AddIsValidOverallToSalesTable1594244787285';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `sales` ADD `isValidOverall` tinyint NULL COMMENT 'Válido para Overall' DEFAULT NULL",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `sales` CHANGE `isValid` `isValid` tinyint NULL COMMENT 'Válido para Club Presidente' DEFAULT NULL",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `sales` CHANGE `isValid` `isValid` tinyint NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `isValidOverall`',
      undefined,
    );
  }
}

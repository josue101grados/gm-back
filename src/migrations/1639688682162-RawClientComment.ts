import { MigrationInterface, QueryRunner } from 'typeorm';

export class RawClientComment1639688682162 implements MigrationInterface {
  name = 'RawClientComment1639688682162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isFleet`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isChevyPlan`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD `isChevyPlan` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD `isFleet` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `leads` ADD `rawClientComment` text NULL COMMENT 'Comentarios del Cliente'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `rawClientComment`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `isFleet`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `isChevyPlan`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isChevyPlan` tinyint NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isFleet` tinyint NULL',
      undefined,
    );
  }
}

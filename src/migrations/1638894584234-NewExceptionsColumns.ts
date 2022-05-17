import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewExceptionsColumns1638894584234 implements MigrationInterface {
  name = 'NewExceptionsColumns1638894584234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `exceptions` ADD `document` varchar(255) NULL COMMENT 'Documento'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `exceptions` ADD `names` varchar(255) NULL COMMENT 'Nombres'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `exceptions` ADD `lastNames` varchar(255) NULL COMMENT 'Apellidos'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `exceptions` ADD `mobile` varchar(20) NULL COMMENT 'Celular'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `exceptions` ADD `phone` varchar(20) NULL COMMENT 'Teléfono'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `exceptions` ADD `workPhone` varchar(20) NULL COMMENT 'Teléfono del trabajo'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `exceptions` ADD `email` varchar(255) NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `email`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `workPhone`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `phone`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `mobile`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `lastNames`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `names`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `document`',
      undefined,
    );
  }
}

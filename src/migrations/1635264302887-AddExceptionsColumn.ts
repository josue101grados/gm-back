import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExceptionsColumn1635264302887 implements MigrationInterface {
  name = 'AddExceptionsColumn1635264302887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE exceptions CHANGE creationDate derivationDate timestamp NULL COMMENT 'Fecha de creación'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `exceptions` ADD `siebelDate` timestamp NULL COMMENT 'Fecha de creación Minúscula'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `exceptions` ADD `isValid` tinyint NOT NULL COMMENT 'fechaDerivación >= fechaSiebel' DEFAULT 1",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `isValid`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `siebelDate`',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE exceptions CHANGE derivationDate creationDate timestamp NULL COMMENT 'Fecha de creación'",
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGMFColumns1629836954661 implements MigrationInterface {
  name = 'AddGMFColumns1629836954661';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `isInterestedInFinancing` tinyint NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `serieRUT` varchar(255) NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `birthDate` date NULL',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `live_store` ADD `maritalStatus` enum ('Soltero', 'Casado Bien', 'Casado Separado', 'Viudo', 'Divorciado') NULL",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `live_store` ADD `clientType` enum ('Dependiente', 'Independiente', 'FFAA / Policial') NULL",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `yearsOnCurrentJob` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `monthlyIncome` float NULL',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `live_store` ADD `version` enum ('Premier', 'Entrada', 'Intermedia', 'Intermedia AT', 'Intermedia AT y MT', 'Diesel') NULL",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `live_store` ADD `threshold` varchar(255) NULL COMMENT 'Pie ($/%)'",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `plan` varchar(255) NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `deadline` varchar(255) NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `preapprovedCredit` tinyint NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `preapprovedCredit`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `deadline`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `plan`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `threshold`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `version`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `monthlyIncome`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `yearsOnCurrentJob`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `clientType`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `maritalStatus`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `birthDate`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `serieRUT`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `isInterestedInFinancing`',
      undefined,
    );
  }
}

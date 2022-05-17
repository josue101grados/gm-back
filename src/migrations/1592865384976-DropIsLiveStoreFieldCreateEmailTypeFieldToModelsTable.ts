import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropIsLiveStoreFieldCreateEmailTypeFieldToModelsTable1592865384976
  implements MigrationInterface {
  name = 'DropIsLiveStoreFieldCreateEmailTypeFieldToModelsTable1592865384976';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `models` DROP COLUMN `liveStore`',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `models` ADD `emailType` varchar(50) NULL COMMENT 'Tipo de email'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `models` ADD `liveStore` tinyint NOT NULL DEFAULT 0',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `models` DROP COLUMN `emailType`',
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLiveStoreToModelsTable1592262345207
  implements MigrationInterface {
  name = 'AddLiveStoreToModelsTable1592262345207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `models` ADD `liveStore` tinyint NOT NULL DEFAULT 0',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `models` DROP COLUMN `liveStore`',
      undefined,
    );
  }
}

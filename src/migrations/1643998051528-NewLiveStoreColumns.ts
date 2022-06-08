import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewLiveStoreColumns1643998051528 implements MigrationInterface {
  name = 'NewLiveStoreColumns1643998051528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `notVirtualExperienceReason` varchar(255) NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `notVirtualExperienceReason`',
      undefined,
    );
  }
}

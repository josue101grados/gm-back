import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewColumnsToLiveStore1632433264332 implements MigrationInterface {
  name = 'NewColumnsToLiveStore1632433264332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `chosenModel` varchar(255) NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `monthsOnCurrentJob` int NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `monthsOnCurrentJob`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `chosenModel`',
      undefined,
    );
  }
}

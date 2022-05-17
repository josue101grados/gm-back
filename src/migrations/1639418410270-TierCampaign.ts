import { MigrationInterface, QueryRunner } from 'typeorm';

export class TierCampaign1639418410270 implements MigrationInterface {
  name = 'TierCampaign1639418410270';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `campaigns` ADD `tier` enum ('T1', 'T2', 'T3') NULL",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `campaigns` DROP COLUMN `tier`',
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCampaignNameToExceptions1626368489186
  implements MigrationInterface {
  name = 'AddCampaignNameToExceptions1626368489186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `exceptions` ADD `campaignName` varchar(50) NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `exceptions` DROP COLUMN `campaignName`',
      undefined,
    );
  }
}

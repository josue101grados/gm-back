import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTemporalLeadsTable1630926567459
  implements MigrationInterface {
  name = 'CreateTemporalLeadsTable1630926567459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `temporal_leads` (`id` int NOT NULL AUTO_INCREMENT, `opportunityName` varchar(40) NOT NULL, `document` varchar(255) NULL, `names` varchar(255) NULL COMMENT 'Nombres', `lastNames` varchar(255) NULL COMMENT 'Apellidos', `modelName` varchar(255) NOT NULL, `campaignName` varchar(255) NOT NULL, `email` varchar(255) NULL, `mobile` varchar(20) NULL, `dealerDealershipName` varchar(255) NOT NULL, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `dealerDealershipId` int NULL, UNIQUE INDEX `IDX_4ae2c73a79bd60cc39479a3972` (`opportunityName`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `temporal_lead_id` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD UNIQUE INDEX `IDX_375f8da4b9979369ba85176144` (`temporal_lead_id`)',
      undefined,
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `REL_375f8da4b9979369ba85176144` ON `live_store` (`temporal_lead_id`)',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD CONSTRAINT `FK_375f8da4b9979369ba851761449` FOREIGN KEY (`temporal_lead_id`) REFERENCES `leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `temporal_leads` ADD CONSTRAINT `FK_7bfea9f34806e8c082abe50159c` FOREIGN KEY (`dealerDealershipId`) REFERENCES `dealer_dealerships`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `temporal_leads` DROP FOREIGN KEY `FK_7bfea9f34806e8c082abe50159c`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP FOREIGN KEY `FK_375f8da4b9979369ba851761449`',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `REL_375f8da4b9979369ba85176144` ON `live_store`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP INDEX `IDX_375f8da4b9979369ba85176144`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `temporal_lead_id`',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `IDX_4ae2c73a79bd60cc39479a3972` ON `temporal_leads`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `temporal_leads`', undefined);
  }
}

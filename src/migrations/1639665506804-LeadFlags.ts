import { MigrationInterface, QueryRunner } from 'typeorm';

export class LeadFlags1639665506804 implements MigrationInterface {
  name = 'LeadFlags1639665506804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `sales` ADD `instanceSlug` varchar(2) NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isOverall` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isSaleOverall` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isFranchiseLead` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isFiltered` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isFilteredSale` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isDerived` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isDerivedSale` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isContactabilityAudited` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isPacLead` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isPacSale` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isLiveStoreLead` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isLiveStoreSale` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isDocumentNull` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isTruckOrBus` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isFleet` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isOnExcludedCampaigns` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `isChevyPlan` tinyint NULL DEFAULT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` ADD `instanceSlug` varchar(2) NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `instanceSlug`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isChevyPlan`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isOnExcludedCampaigns`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isFleet`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isTruckOrBus`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isDocumentNull`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isLiveStoreSale`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isLiveStoreLead`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isPacSale`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isPacLead`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isContactabilityAudited`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isDerivedSale`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isDerived`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isFilteredSale`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isFiltered`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isFranchiseLead`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isSaleOverall`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `leads` DROP COLUMN `isOverall`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `instanceSlug`',
      undefined,
    );
  }
}

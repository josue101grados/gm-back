import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResultsTable1653582758169 implements MigrationInterface {
  name = 'CreateResultsTable1653582758169';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `results_leads_sales` (`id` int NOT NULL AUTO_INCREMENT, `are120results` tinyint NOT NULL DEFAULT 1, `are360results` tinyint NOT NULL DEFAULT 0, `leadMonth` int NOT NULL, `leadYear` int NOT NULL, `january` int NOT NULL DEFAULT 0, `february` int NOT NULL DEFAULT 0, `march` int NOT NULL DEFAULT 0, `april` int NOT NULL DEFAULT 0, `may` int NOT NULL DEFAULT 0, `june` int NOT NULL DEFAULT 0, `july` int NOT NULL DEFAULT 0, `august` int NOT NULL DEFAULT 0, `september` int NOT NULL DEFAULT 0, `october` int NOT NULL DEFAULT 0, `november` int NOT NULL DEFAULT 0, `december` int NOT NULL DEFAULT 0, `validLeads` int NOT NULL DEFAULT 0, `totalSales` int NOT NULL DEFAULT 0, `closingRate` float NOT NULL DEFAULT 0, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `dealerGroupId` int NULL, `dealerCityId` int NULL, `dealerDealershipId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `results_leads_sales` ADD CONSTRAINT `FK_adb5f3370bc7909502ee3f9da13` FOREIGN KEY (`dealerGroupId`) REFERENCES `dealer_groups`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `results_leads_sales` ADD CONSTRAINT `FK_54f19b4e51de64236d3a5487d48` FOREIGN KEY (`dealerCityId`) REFERENCES `dealer_cities`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `results_leads_sales` ADD CONSTRAINT `FK_feb8d516f0b41ef2d94c9eb570f` FOREIGN KEY (`dealerDealershipId`) REFERENCES `dealer_dealerships`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `results_leads_sales` DROP FOREIGN KEY `FK_feb8d516f0b41ef2d94c9eb570f`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `results_leads_sales` DROP FOREIGN KEY `FK_54f19b4e51de64236d3a5487d48`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `results_leads_sales` DROP FOREIGN KEY `FK_adb5f3370bc7909502ee3f9da13`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `results_leads_sales`', undefined);
  }
}

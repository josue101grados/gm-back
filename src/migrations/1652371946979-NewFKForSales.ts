import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewFKForSales1652371946979 implements MigrationInterface {
  name = 'NewFKForSales1652371946979';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `sales` ADD `overallLead120Id` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD `franchiseLead120Id` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD `overallLead360Id` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD `franchiseLead360Id` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD `overallLeadXTimeId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD `franchiseLeadXTimeId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD CONSTRAINT `FK_5e467f711a5b76ee19172c77217` FOREIGN KEY (`overallLead120Id`) REFERENCES `leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD CONSTRAINT `FK_af7d5b46e39480c82b65365c250` FOREIGN KEY (`franchiseLead120Id`) REFERENCES `leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD CONSTRAINT `FK_7f7c79b24c02a6d16d890e613f9` FOREIGN KEY (`overallLead360Id`) REFERENCES `leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD CONSTRAINT `FK_a539f498a8863d9c7268a5ccbb7` FOREIGN KEY (`franchiseLead360Id`) REFERENCES `leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD CONSTRAINT `FK_e4d9922b4e27349592bfa71a4bd` FOREIGN KEY (`overallLeadXTimeId`) REFERENCES `leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` ADD CONSTRAINT `FK_7c5ed6017a6c0c720c4503d5ab6` FOREIGN KEY (`franchiseLeadXTimeId`) REFERENCES `leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `sales` DROP FOREIGN KEY `FK_7c5ed6017a6c0c720c4503d5ab6`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP FOREIGN KEY `FK_e4d9922b4e27349592bfa71a4bd`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP FOREIGN KEY `FK_a539f498a8863d9c7268a5ccbb7`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP FOREIGN KEY `FK_7f7c79b24c02a6d16d890e613f9`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP FOREIGN KEY `FK_af7d5b46e39480c82b65365c250`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP FOREIGN KEY `FK_5e467f711a5b76ee19172c77217`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `franchiseLeadXTimeId`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `overallLeadXTimeId`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `franchiseLead360Id`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `overallLead360Id`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `franchiseLead120Id`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `sales` DROP COLUMN `overallLead120Id`',
      undefined,
    );
  }
}

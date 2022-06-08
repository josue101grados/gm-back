import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunnelTable1593137409493 implements MigrationInterface {
  name = 'CreateFunnelTable1593137409493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `funnels` (`id` int NOT NULL AUTO_INCREMENT, `clickOnWhatsapp` tinyint NOT NULL DEFAULT 0, `clickOnWhatsappDate` timestamp NULL COMMENT 'Fecha Click Whatsapp', `clickOnCallUs` tinyint NOT NULL DEFAULT 0, `clickOnCallUsDate` timestamp NULL COMMENT 'Fecha Click Call Us', `clickOnFindUs` tinyint NOT NULL DEFAULT 0, `clickOnFindUsDate` timestamp NULL COMMENT 'Fecha Click Find Us', `opportunityName` varchar(40) NULL, `emailType` varchar(50) NULL COMMENT 'Tipo de email', `inxaitDownloadAt` timestamp NULL, `sms` tinyint NOT NULL DEFAULT 0, `email` tinyint NOT NULL DEFAULT 0, `send` tinyint NOT NULL DEFAULT 0, `open` tinyint NOT NULL DEFAULT 0, `click` tinyint NOT NULL DEFAULT 0, `bounced` timestamp NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `leadId` int NULL, `sourcedLeadId` int NULL, INDEX `IDX_leads_opportunity_name` (`opportunityName`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `funnels` ADD CONSTRAINT `FK_3ce221564edffd94d916ca87f33` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `funnels` ADD CONSTRAINT `FK_a0cd52bf015a5c237aa18037839` FOREIGN KEY (`sourcedLeadId`) REFERENCES `sourced_leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `funnels` DROP FOREIGN KEY `FK_a0cd52bf015a5c237aa18037839`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `funnels` DROP FOREIGN KEY `FK_3ce221564edffd94d916ca87f33`',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `IDX_leads_opportunity_name` ON `funnels`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `funnels`', undefined);
  }
}

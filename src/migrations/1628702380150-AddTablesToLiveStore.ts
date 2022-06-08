import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTablesToLiveStore1628702380150 implements MigrationInterface {
  name = 'AddTablesToLiveStore1628702380150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `advisers` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(32) NOT NULL, `lastName` varchar(32) NOT NULL, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `dealerGroupId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `dealerManagementDate` datetime NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `callAttempt` tinyint NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `effectiveContact` tinyint NULL',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `live_store` ADD `status` enum ('EN SEGUIMIENTO', 'COTIZACION ENVIADA', 'PROGRAMO VISITA AL DEALER', 'DESISTE DE LA COMPRA', 'POSTERGA LA COMPRA', 'NO CONTESTA') NULL",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `financing` tinyint NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD `adviserId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `advisers` ADD CONSTRAINT `FK_a55bf9764bf6d1f8d94a1bf5a81` FOREIGN KEY (`dealerGroupId`) REFERENCES `dealer_groups`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD CONSTRAINT `FK_c26c1c5cb5b0c7067d2f5357e80` FOREIGN KEY (`adviserId`) REFERENCES `advisers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP FOREIGN KEY `FK_c26c1c5cb5b0c7067d2f5357e80`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `advisers` DROP FOREIGN KEY `FK_a55bf9764bf6d1f8d94a1bf5a81`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `adviserId`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `financing`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `status`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `effectiveContact`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `callAttempt`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP COLUMN `dealerManagementDate`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `advisers`', undefined);
  }
}

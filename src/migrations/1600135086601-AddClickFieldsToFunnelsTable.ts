import {MigrationInterface, QueryRunner} from "typeorm";

export class AddClickFieldsToFunnelsTable1600135086601 implements MigrationInterface {
  name = 'AddClickFieldsToFunnelsTable1600135086601';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `funnels` DROP COLUMN `clickOnLiveStore`", undefined);
        await queryRunner.query("ALTER TABLE `funnels` DROP COLUMN `clickOnLiveStoreDate`", undefined);
        await queryRunner.query("ALTER TABLE `funnels` ADD `clickOnCallUs` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `funnels` ADD `clickOnCallUsDate` timestamp NULL COMMENT 'Fecha Click LLamanos'", undefined);
        await queryRunner.query("ALTER TABLE `funnels` ADD `clickOnHeader` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `funnels` ADD `clickOnHeaderDate` timestamp NULL COMMENT 'Fecha Click Imagen principal'", undefined);
        await queryRunner.query("ALTER TABLE `funnels` ADD `clickOnModel` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `funnels` ADD `clickOnModelDate` timestamp NULL COMMENT 'Fecha Click Modelo'", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `funnels` DROP COLUMN `clickOnModelDate`", undefined);
        await queryRunner.query("ALTER TABLE `funnels` DROP COLUMN `clickOnModel`", undefined);
        await queryRunner.query("ALTER TABLE `funnels` DROP COLUMN `clickOnHeaderDate`", undefined);
        await queryRunner.query("ALTER TABLE `funnels` DROP COLUMN `clickOnHeader`", undefined);
        await queryRunner.query("ALTER TABLE `funnels` DROP COLUMN `clickOnCallUsDate`", undefined);
        await queryRunner.query("ALTER TABLE `funnels` DROP COLUMN `clickOnCallUs`", undefined);
        await queryRunner.query("ALTER TABLE `funnels` ADD `clickOnLiveStoreDate` timestamp NULL COMMENT 'Fecha Click Live Store'", undefined);
        await queryRunner.query("ALTER TABLE `funnels` ADD `clickOnLiveStore` tinyint NOT NULL DEFAULT '0'", undefined);
    }

}

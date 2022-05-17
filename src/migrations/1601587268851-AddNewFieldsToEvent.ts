import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNewFieldsToEvent1601587268851 implements MigrationInterface {
    name = 'AddNewFieldsToEvent1601587268851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` ADD `quoteAsked` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `events` ADD `creditRequested` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `events` ADD `creditApproved` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `events` ADD `purchasePostponed` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `events` ADD `reservation` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `events` ADD `differentIdSale` tinyint NOT NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `events` ADD `billed` tinyint NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `billed`", undefined);
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `differentIdSale`", undefined);
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `reservation`", undefined);
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `purchasePostponed`", undefined);
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `creditApproved`", undefined);
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `creditRequested`", undefined);
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `quoteAsked`", undefined);
    }

}

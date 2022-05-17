import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIgnoreOnFunnelsField1605734715518 implements MigrationInterface {
    name = 'AddIgnoreOnFunnelsField1605734715518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `dealer_groups` ADD `ignoreOnFunnels` tinyint NOT NULL COMMENT 'Si se ignora para los reportes de Funnels' DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `dealer_groups` DROP COLUMN `ignoreOnFunnels`", undefined);
    }

}

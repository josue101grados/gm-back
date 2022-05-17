import { MigrationInterface, QueryRunner } from 'typeorm';

export class SaveInstanceNumberOnTask1649977524110
  implements MigrationInterface {
  name = 'SaveInstanceNumberOnTask1649977524110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `tasks` ADD `instanceNumber` int NULL COMMENT 'Ayuda a saber a qué número de instancia/servidor corresponde cada uno'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tasks` DROP COLUMN `instanceNumber`',
      undefined,
    );
  }
}

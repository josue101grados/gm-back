import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRejectedCreditsFieldToT1Funnel1597875958073
  implements MigrationInterface {
  name = 'AddRejectedCreditsFieldToT1Funnel1597875958073';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `T1Funnels` ADD `creditRejections` json NOT NULL COMMENT 'Solicitudes de crédito rechazadas'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `T1Funnels` DROP COLUMN `creditRejections`',
      undefined,
    );
  }
}

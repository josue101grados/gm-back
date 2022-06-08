import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventNotInterestedReasonColumn1609786052128
  implements MigrationInterface {
  name = 'AddEventNotInterestedReasonColumn1609786052128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `events` ADD `notInterestedReason` enum ('DESISTE DE LA COMPRA', 'COMPRO OTRA MARCA', 'NO CUMPLE PERFIL', 'INTERESADO EN USADO', 'CHEVYPLAN', 'OTROS') NULL COMMENT 'Razón por la que no está interesado'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `events` DROP COLUMN `notInterestedReason`',
      undefined,
    );
  }
}

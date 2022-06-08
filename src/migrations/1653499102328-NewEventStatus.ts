import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewEventStatus1653499102328 implements MigrationInterface {
  name = 'NewEventStatus1653499102328';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `events` CHANGE `status` `status` enum ('ACTIVO', 'CONFIRMADA', 'CANCELADO', 'CADUCADO', 'COMPLETADO', 'LLAMAR_MAS_TARDE') NOT NULL COMMENT 'Estado del evento' DEFAULT 'ACTIVO'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `events` CHANGE `status` `status` enum ('ACTIVO', 'CONFIRMADA', 'CANCELADO', 'CADUCADO', 'COMPLETADO') CHARACTER SET \"utf8mb3\" COLLATE \"utf8_general_ci\" NOT NULL COMMENT 'Estado del evento' DEFAULT 'ACTIVO'",
      undefined,
    );
  }
}

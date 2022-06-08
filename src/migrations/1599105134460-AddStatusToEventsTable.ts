import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToEventsTable1599105134460 implements MigrationInterface {
  name = 'AddStatusToEventsTable1599105134460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE events CHANGE userId userId int NOT NULL',
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE events
      CHANGE status status enum ('ACTIVO', 'CONFIRMADA', 'CANCELADO', 'CADUCADO', 'COMPLETADO')
      NOT NULL COMMENT 'Estado del evento' DEFAULT 'ACTIVO'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events
      CHANGE status status enum ('ACTIVO', 'CANCELADO', 'CADUCADO', 'COMPLETADO')
      NOT NULL COMMENT 'Estado del evento' DEFAULT 'ACTIVO'`,
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE events CHANGE userId userId int NULL',
      undefined,
    );
  }
}

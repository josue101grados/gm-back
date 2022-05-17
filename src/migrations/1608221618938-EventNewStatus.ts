import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventNewStatus1608221618938 implements MigrationInterface {
  name = 'EventNewStatus1608221618938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `events` CHANGE `saleStatus` `saleStatus` enum ('NO CONTACTADO', 'NO INTERESADO', 'ASIGNADO A VENDEDOR') NOT NULL COMMENT 'Estado de la venta' DEFAULT 'NO CONTACTADO'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `events` CHANGE `saleStatus` `saleStatus` enum ('NO INTERESADO', 'ASIGNADO A VENDEDOR') CHARACTER SET \"utf8\" COLLATE \"utf8_general_ci\" NOT NULL COMMENT 'Estado de la venta' DEFAULT 'NO INTERESADO'",
      undefined,
    );
  }
}

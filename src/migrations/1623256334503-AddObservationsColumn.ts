import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObservationsColumn1623256334503 implements MigrationInterface {
  name = 'AddObservationsColumn1623256334503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads` CHANGE `lastManagementHour` `lastManagementHour` timestamp NULL COMMENT 'Hora última de gestión'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads` CHANGE `lastManagementDate` `lastManagementDate` timestamp NULL COMMENT 'Fecha última de gestión'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads` ADD `justificationObservation` enum ('No envía justificación', 'Contacto posterior a la encuesta', 'Evidencia no demuestra contacto') NULL COMMENT 'Observación de la respuesta a la justificación'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads_attachments` ADD `justificationObservation` enum ('No envía justificación', 'Contacto posterior a la encuesta', 'Evidencia no demuestra contacto') NULL COMMENT 'Observación de la respuesta a la justificación'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `not_contacted_leads_attachments` DROP COLUMN `justificationObservation`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `not_contacted_leads` DROP COLUMN `justificationObservation`',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads` CHANGE `lastManagementDate` `lastManagementDate` timestamp NOT NULL COMMENT 'Fecha última de gestión' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads` CHANGE `lastManagementHour` `lastManagementHour` timestamp NOT NULL COMMENT 'Hora última de gestión' DEFAULT '0000-00-00 00:00:00'",
      undefined,
    );
  }
}

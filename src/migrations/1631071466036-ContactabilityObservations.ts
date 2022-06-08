import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContactabilityObservations1631071466036
  implements MigrationInterface {
  name = 'ContactabilityObservations1631071466036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads` CHANGE `justificationObservation` `justificationObservation` enum ('No envía justificación', 'Contacto posterior a la encuesta', 'Evidencia no demuestra contacto', 'Evidencia no corresponde al lead', 'No indica a quien pertenece el lead', 'No hay comunicación bidireccional', 'No se observa fecha de contacto') NULL COMMENT 'Observación de la respuesta a la justificación'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads_attachments` CHANGE `justificationObservation` `justificationObservation` enum ('No envía justificación', 'Contacto posterior a la encuesta', 'Evidencia no demuestra contacto', 'Evidencia no corresponde al lead', 'No indica a quien pertenece el lead', 'No hay comunicación bidireccional', 'No se observa fecha de contacto') NULL COMMENT 'Observación de la respuesta a la justificación'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads_attachments` CHANGE `justificationObservation` `justificationObservation` enum ('No envía justificación', 'Contacto posterior a la encuesta', 'Evidencia no demuestra contacto') CHARACTER SET \"utf8\" COLLATE \"utf8_general_ci\" NULL COMMENT 'Observación de la respuesta a la justificación'",
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `not_contacted_leads` CHANGE `justificationObservation` `justificationObservation` enum ('No envía justificación', 'Contacto posterior a la encuesta', 'Evidencia no demuestra contacto') CHARACTER SET \"utf8\" COLLATE \"utf8_general_ci\" NULL COMMENT 'Observación de la respuesta a la justificación'",
      undefined,
    );
  }
}

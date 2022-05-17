import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMailgunEventsTable1592868998925
  implements MigrationInterface {
  name = 'CreateMailgunEventsTable1592868998925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE mailgun_events (
        id int NOT NULL AUTO_INCREMENT,
        event varchar(255) NOT NULL,
        recipient varchar(255) NOT NULL,
        data json NULL COMMENT 'Datos sobre el evento',
        createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (id)) ENGINE=InnoDB`,
      undefined,
    );

    await queryRunner.query(
      'CREATE INDEX `IDX_mailgun_events_event` ON `mailgun_events` (`event`)',
      undefined,
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_mailgun_events_recipient` ON `mailgun_events` (`recipient`)',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_mailgun_events_recipient` ON `mailgun_events`',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `IDX_mailgun_events_event` ON `mailgun_events`',
      undefined,
    );
    await queryRunner.query('DROP TABLE mailgun_events', undefined);
  }
}

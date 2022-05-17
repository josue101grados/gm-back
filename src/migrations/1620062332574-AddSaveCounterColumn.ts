import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSaveCounterColumn1620062332574 implements MigrationInterface {
  name = 'AddSaveCounterColumn1620062332574';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE dealer_groups
        ADD editionCounter int NOT NULL COMMENT \'Times the dealer press "Guardar" when edit Resumen Funnel\' DEFAULT 0
      `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE dealer_groups 
        DROP COLUMN editionCounter
      `,
      undefined,
    );
  }
}

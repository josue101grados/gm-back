import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeSourceColumns1588573121401 implements MigrationInterface {
  name = 'ChangeSourceColumns1588573121401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE campaigns CHANGE source source VARCHAR(255) NULL',
      undefined,
    );
    await queryRunner.query('DROP INDEX IDX_leads_source ON leads', undefined);
    await queryRunner.query(
      'ALTER TABLE leads CHANGE source source VARCHAR(255) NULL',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX IDX_leads_source ON sourced_leads',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE sourced_leads CHANGE source source VARCHAR(255) NULL',
      undefined,
    );
    await queryRunner.query(
      'CREATE INDEX IDX_leads_source ON leads (source)',
      undefined,
    );
    await queryRunner.query(
      'CREATE INDEX IDX_leads_source ON sourced_leads (source)',
      undefined,
    );

    await queryRunner.query(
      'DROP INDEX IDX_dealer_cities_name ON dealer_cities',
      undefined,
    );
    await queryRunner.query(
      'CREATE INDEX IDX_dealer_cities_name ON dealer_cities (name)',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IDX_leads_source ON sourced_leads',
      undefined,
    );
    await queryRunner.query('DROP INDEX IDX_leads_source ON leads', undefined);
    await queryRunner.query(
      'ALTER TABLE sourced_leads CHANGE source source varchar(20) NULL',
      undefined,
    );
    await queryRunner.query(
      'CREATE INDEX IDX_leads_source ON sourced_leads (source)',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE leads CHANGE source source varchar(20) NULL',
      undefined,
    );
    await queryRunner.query(
      'CREATE INDEX IDX_leads_source ON leads (source)',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE campaigns CHANGE source source VARCHAR(80) NULL',
      undefined,
    );

    await queryRunner.query(
      'DROP INDEX IDX_dealer_cities_name ON dealer_cities',
      undefined,
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IDX_dealer_cities_name ON dealer_cities (name)',
      undefined,
    );
  }
}

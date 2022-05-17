import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeBacNullableInSourcedLeadsTable1589251210302
  implements MigrationInterface {
  name = 'MakeBacNullableInSourcedLeadsTable1589251210302';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE sourced_leads CHANGE campaignName campaignName varchar(255) NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE sourced_leads CHANGE bac bac varchar(6) NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE sourced_leads CHANGE modelName modelName varchar(255) NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE sourced_leads CHANGE modelName modelName varchar(255) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE sourced_leads CHANGE bac bac varchar(6) NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE sourced_leads CHANGE campaignName campaignName varchar(255) NOT NULL',
      undefined,
    );
  }
}

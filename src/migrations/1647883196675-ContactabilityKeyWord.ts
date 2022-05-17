import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContactabilityKeyWord1647883196675 implements MigrationInterface {
  name = 'ContactabilityKeyWord1647883196675';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `not_contacted_leads` ADD `keyWord` varchar(255) NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `not_contacted_leads` DROP COLUMN `keyWord`',
      undefined,
    );
  }
}

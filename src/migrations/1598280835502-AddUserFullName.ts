import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserFullName1598280835502 implements MigrationInterface {
  name = 'AddUserFullName1598280835502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `fullname` varchar(255) NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `fullname`',
      undefined,
    );
  }
}

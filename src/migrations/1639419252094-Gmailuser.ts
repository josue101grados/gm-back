import { MigrationInterface, QueryRunner } from 'typeorm';

export class Gmailuser1639419252094 implements MigrationInterface {
  name = 'Gmailuser1639419252094';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` CHANGE `credentialsExpireAt` `credentialsExpireAt` timestamp NOT NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `users` CHANGE `email` `email` varchar(255) NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `users` ADD `gmailEmail` varchar(255) NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `users` ADD `instance` varchar(255) NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `instance`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `gmailEmail`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `users` CHANGE `email` `email` varchar(255) CHARACTER SET "utf8" COLLATE "utf8_general_ci" NOT NULL',
      undefined,
    );
    await queryRunner.query(
      "ALTER TABLE `users` CHANGE `credentialsExpireAt` `credentialsExpireAt` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'",
      undefined,
    );
  }
}

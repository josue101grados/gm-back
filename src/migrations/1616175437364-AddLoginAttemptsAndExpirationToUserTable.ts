import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoginAttemptsAndExpirationToUserTable1616175437364
  implements MigrationInterface {
  name = 'AddLoginAttemptsAndExpirationToUserTable1616175437364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `users` ADD `loginAttempts` int NOT NULL COMMENT 'Increase in 1 if the login failed' DEFAULT 0",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `users` ADD `credentialsExpireAt` timestamp NOT NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `credentialsExpireAt`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `loginAttempts`',
      undefined,
    );
  }
}

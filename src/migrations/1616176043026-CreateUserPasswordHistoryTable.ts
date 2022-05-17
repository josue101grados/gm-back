import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPasswordHistoryTable1616176043026
  implements MigrationInterface {
  name = 'CreateUserPasswordHistoryTable1616176043026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `user_password_history` (`id` int NOT NULL AUTO_INCREMENT, `password` varchar(255) NOT NULL, `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `user_password_history` ADD CONSTRAINT `FK_d21d620114e6a059228a5b27b47` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_password_history` DROP FOREIGN KEY `FK_d21d620114e6a059228a5b27b47`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `user_password_history`', undefined);
  }
}

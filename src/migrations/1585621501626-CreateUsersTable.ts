import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1585621501626 implements MigrationInterface {
  name = 'CreateUsersTable1585621501626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE users (
        id int NOT NULL AUTO_INCREMENT,
        username varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        isActive tinyint NOT NULL DEFAULT 1,
        lastLoginAt timestamp NULL,
        createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX IDX_users_email (email), PRIMARY KEY (id)
      ) ENGINE=InnoDB`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IDX_users_email ON users', undefined);
    await queryRunner.query('DROP TABLE users', undefined);
  }
}

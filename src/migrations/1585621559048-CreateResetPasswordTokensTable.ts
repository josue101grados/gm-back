import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResetPasswordTokensTable1585621559048
  implements MigrationInterface {
  name = 'CreateResetPasswordTokensTable1585621559048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE reset_password_tokens (
        token varchar(255) NOT NULL,
        expiresAt datetime NOT NULL,
        ownerId int NULL, PRIMARY KEY (token)
      ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE reset_password_tokens
      ADD CONSTRAINT FK_f50894d803f4f6fa3449d3fce1b FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE reset_password_tokens DROP FOREIGN KEY FK_f50894d803f4f6fa3449d3fce1b`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE reset_password_tokens`, undefined);
  }
}

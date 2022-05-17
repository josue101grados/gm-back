import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccessTokensTable1585621559050
  implements MigrationInterface {
  name = 'CreateAccessTokensTable1585621559050';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE access_tokens (
        id varchar(255) NOT NULL,
        revoked tinyint NOT NULL DEFAULT 0,
        expiresAt timestamp(0) NOT NULL,
        userId int NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE refresh_tokens (
        id varchar(255) NOT NULL,
        revoked tinyint NOT NULL DEFAULT 0,
        expiresAt timestamp(0) NOT NULL,
        accessTokenId varchar(255) NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE access_tokens
      ADD CONSTRAINT FK_343a101d109c86071f2b2fb43e7 FOREIGN KEY (userId) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE refresh_tokens
      ADD CONSTRAINT FK_55e00528f3e7b3c6ae2a042bd86 FOREIGN KEY (accessTokenId) REFERENCES access_tokens(id) ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE refresh_tokens DROP FOREIGN KEY FK_55e00528f3e7b3c6ae2a042bd86`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE access_tokens DROP FOREIGN KEY FK_343a101d109c86071f2b2fb43e7`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE refresh_tokens`, undefined);
    await queryRunner.query(`DROP TABLE access_tokens`, undefined);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTable1585621527699 implements MigrationInterface {
  name = 'CreateRolesTable1585621527699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE roles (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE users_roles (
        usersId int NOT NULL,
        rolesId int NOT NULL,
        INDEX IDX_deeb1fe94ce2d111a6695a2880 (usersId),
        INDEX IDX_21db462422f1f97519a29041da (rolesId),
        PRIMARY KEY (usersId, rolesId)
      ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE users_roles
      ADD CONSTRAINT FK_deeb1fe94ce2d111a6695a2880e FOREIGN KEY (usersId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE users_roles
      ADD CONSTRAINT FK_21db462422f1f97519a29041da0 FOREIGN KEY (rolesId) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users_roles DROP FOREIGN KEY FK_21db462422f1f97519a29041da0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE users_roles DROP FOREIGN KEY FK_deeb1fe94ce2d111a6695a2880e`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_21db462422f1f97519a29041da ON users_roles`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_deeb1fe94ce2d111a6695a2880 ON users_roles`,
      undefined,
    );
    await queryRunner.query('DROP TABLE users_roles', undefined);
    await queryRunner.query('DROP TABLE roles', undefined);
  }
}

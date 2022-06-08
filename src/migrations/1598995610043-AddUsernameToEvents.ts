import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToEvents1598995610043 implements MigrationInterface {
  name = 'AddUsernameToEvents1598995610043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE events DROP FOREIGN KEY FK_9929fa8516afa13f87b41abb263',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE events ADD userFullName varchar(255) NULL',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE events DROP COLUMN userFullName',
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE events ADD CONSTRAINT FK_9929fa8516afa13f87b41abb263 FOREIGN KEY (userId)
      REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}

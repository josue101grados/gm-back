import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInstancesTable1597288047048 implements MigrationInterface {
  name = 'CreateInstancesTable1597288047048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE instances (
          id int NOT NULL AUTO_INCREMENT,
          slug varchar(2) NOT NULL,
          name varchar(255) NOT NULL,
          url varchar(255) NOT NULL,
          apiKey varchar(255) NOT NULL,
          UNIQUE INDEX IDX_instances_slug (slug),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IDX_instances_slug ON instances',
      undefined,
    );
    await queryRunner.query('DROP TABLE instances', undefined);
  }
}

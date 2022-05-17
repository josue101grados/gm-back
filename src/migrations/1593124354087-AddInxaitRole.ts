import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInxaitRole1593124354087 implements MigrationInterface {
  name = 'addInxaitRole1593124354087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO `roles` (`name`) VALUES ('inxait')",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DELETE FROM `roles` WHERE (`name` = 'inxait');",
      undefined,
    );
  }
}

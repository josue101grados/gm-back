import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDealerGroupToUsersTable1588640096172
  implements MigrationInterface {
  name = 'AddDealerGroupToUsersTable1588640096172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE users ADD dealerGroupId int NULL',
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE users
      ADD CONSTRAINT FK_029bc4aa3fea54d4014307d3d3d FOREIGN KEY (dealerGroupId)
      REFERENCES dealer_groups(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE users DROP FOREIGN KEY FK_029bc4aa3fea54d4014307d3d3d',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE users DROP COLUMN dealerGroupId',
      undefined,
    );
  }
}

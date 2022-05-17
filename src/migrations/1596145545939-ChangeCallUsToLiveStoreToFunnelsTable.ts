import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCallUsToLiveStoreToFunnelsTable1596145545939
  implements MigrationInterface {
  name = 'ChangeCallUsToLiveStoreToFunnelsTable1596145545939';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE funnels CHANGE clickOnCallUs clickOnLiveStore tinyint NOT NULL DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE funnels CHANGE clickOnCallUsDate clickOnLiveStoreDate timestamp NULL COMMENT 'Fecha Click Live Store'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE funnels CHANGE clickOnLiveStore clickOnCallUs tinyint NOT NULL DEFAULT 0`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE funnels CHANGE clickOnLiveStoreDate clickOnCallUsDate timestamp NULL COMMENT 'Fecha Click Call Us'`,
      undefined,
    );
  }
}

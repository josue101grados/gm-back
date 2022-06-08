import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBooleansToDateFunnelsTable1596579362325
  implements MigrationInterface {
  name = 'ChangeBooleansToDateFunnelsTable1596579362325';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE funnels CHANGE send sendDate timestamp NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE funnels CHANGE open openDate timestamp NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE funnels CHANGE click clickDate timestamp NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE funnels CHANGE bounced bouncedDate timestamp NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE funnels CHANGE sendDate send tinyint NOT NULL DEFAULT 0`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE funnels CHANGE openDate open tinyint NOT NULL DEFAULT 0`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE funnels CHANGE clickDate click tinyint NOT NULL DEFAULT 0`,
      undefined,
    );

    await queryRunner.query(
      `ALTER TABLE funnels CHANGE bouncedDate bounced timestamp NULL`,
      undefined,
    );
  }
}

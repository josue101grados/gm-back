import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDerivedLinkToDealerGroups1599052874017
  implements MigrationInterface {
  name = 'AddDerivedLinkToDealerGroups1599052874017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `dealer_groups` ADD `derivedLink` varchar(255) NULL COMMENT 'Link de derivación. Este link se muestra cuando una cita ha sido derivada'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `dealer_groups` DROP COLUMN `derivedLink`',
      undefined,
    );
  }
}

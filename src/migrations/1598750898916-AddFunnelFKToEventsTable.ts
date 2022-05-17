import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFunnelFKToEventsTable1598750898916
  implements MigrationInterface {
  name = 'AddFunnelFKToEventsTable1598750898916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `events` ADD `funnelId` int NULL',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `events` ADD CONSTRAINT `FK_e4d14c3d6a3ce26a833e352d799` FOREIGN KEY (`funnelId`) REFERENCES `funnels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `events` DROP FOREIGN KEY `FK_e4d14c3d6a3ce26a833e352d799`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `events` DROP COLUMN `funnelId`',
      undefined,
    );
  }
}

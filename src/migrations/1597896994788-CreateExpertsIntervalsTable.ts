import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpertsIntervalsTable1597896994788
  implements MigrationInterface {
  name = 'CreateExpertsIntervalsTable1597896994788';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `experts_intervals` (`id` int NOT NULL AUTO_INCREMENT, `date` date NULL, `monday` tinyint NOT NULL DEFAULT 0, `tuesday` tinyint NOT NULL DEFAULT 0, `wednesday` tinyint NOT NULL DEFAULT 0, `thursday` tinyint NOT NULL DEFAULT 0, `friday` tinyint NOT NULL DEFAULT 0, `saturday` tinyint NOT NULL DEFAULT 0, `sunday` tinyint NOT NULL DEFAULT 0, `from` time NULL, `to` time NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `experts_intervals` ADD CONSTRAINT `FK_00c72f42214e0400af784bd869f` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `experts_intervals` DROP FOREIGN KEY `FK_00c72f42214e0400af784bd869f`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `experts_intervals`', undefined);
  }
}

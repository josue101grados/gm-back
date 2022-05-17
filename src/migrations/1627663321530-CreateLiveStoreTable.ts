import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLiveStoreTable1627663321530 implements MigrationInterface {
  name = 'CreateLiveStoreTable1627663321530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `live_store` (`id` int NOT NULL AUTO_INCREMENT, `managementDate` datetime NOT NULL, `isInterested` tinyint NOT NULL DEFAULT 1, `notInterestedReason` enum ('COSTOSO', 'SOLO ESTABA COTIZANDO', 'QUIERE COMPRAR OTRA MARCA', 'VEHICULO USADO', 'COMPRA A FUTURO', 'NO TIENE PERFIL O NO APLICA', 'QUIERE OTRA ENTIDAD FINANCIERA', 'OTRO METODO DE PAGO') NULL, `virtualExperience` tinyint NOT NULL DEFAULT 1, `virtualExperienceDate` datetime NOT NULL, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `lead_id` int NULL, `user_id` int NULL, UNIQUE INDEX `REL_a6ad1763308c3d7e6b4f507275` (`lead_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD CONSTRAINT `FK_a6ad1763308c3d7e6b4f5072752` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` ADD CONSTRAINT `FK_f382b0c4a9fcf58727b127c2ab0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP FOREIGN KEY `FK_f382b0c4a9fcf58727b127c2ab0`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `live_store` DROP FOREIGN KEY `FK_a6ad1763308c3d7e6b4f5072752`',
      undefined,
    );
    await queryRunner.query(
      'DROP INDEX `REL_a6ad1763308c3d7e6b4f507275` ON `live_store`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `live_store`', undefined);
  }
}

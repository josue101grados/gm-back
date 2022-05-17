import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1597981968408 implements MigrationInterface {
  name = 'CreateEventsTable1597981968408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `events` (`id` int NOT NULL AUTO_INCREMENT, `type` enum ('CITA', 'EXCEPCION') NOT NULL COMMENT 'Tipo de Evento' DEFAULT 'CITA', `exceptionReason` varchar(255) NULL, `status` enum ('ACTIVO', 'CANCELADO', 'CADUCADO', 'COMPLETADO') NOT NULL COMMENT 'Estado del evento' DEFAULT 'ACTIVO', `startDate` datetime NOT NULL, `endDate` datetime NOT NULL, `requestedDate` datetime NULL, `cancellationReason` varchar(255) NULL, `estimatedPurchaseDate` enum ('1 MES', '2 MESES', '3 MESES', '> 3 MESES', 'MENOR A 3 MESES', 'OTROS') NOT NULL COMMENT 'Fecha Estimada de Compra' DEFAULT '1 MES', `requiresFinancing` tinyint NOT NULL DEFAULT 0, `firstVehicle` tinyint NOT NULL DEFAULT 0, `hasAnotherChevrolet` tinyint NOT NULL DEFAULT 0, `otherBrandConsidering` tinyint NOT NULL DEFAULT 0, `comments` varchar(140) NULL, `appointmentFulfilled` tinyint NOT NULL DEFAULT 0, `derived` tinyint NOT NULL DEFAULT 0, `timesReagent` int NULL, `saleStatus` enum ('NO INTERESADO', 'ASIGNADO A VENDEDOR') NOT NULL COMMENT 'Estado de la venta' DEFAULT 'NO INTERESADO', `moneyToBuy` decimal(12,2) NOT NULL, `sellerName` varchar(255) NULL, `sellerLastName` varchar(255) NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userId` int NULL, `modelId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `events` ADD CONSTRAINT `FK_9929fa8516afa13f87b41abb263` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `events` ADD CONSTRAINT `FK_e7d11b3fffa181e710706755a16` FOREIGN KEY (`modelId`) REFERENCES `models`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `events` DROP FOREIGN KEY `FK_e7d11b3fffa181e710706755a16`',
      undefined,
    );
    await queryRunner.query(
      'ALTER TABLE `events` DROP FOREIGN KEY `FK_9929fa8516afa13f87b41abb263`',
      undefined,
    );
    await queryRunner.query('DROP TABLE `events`', undefined);
  }
}

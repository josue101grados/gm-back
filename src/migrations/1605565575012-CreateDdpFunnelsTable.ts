import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDdpFunnelsTable1605565575012 implements MigrationInterface {
    name = 'CreateDdpFunnelsTable1605565575012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `ddpFunnels` (`id` int NOT NULL AUTO_INCREMENT, `year` int NOT NULL COMMENT 'Year this record belongs to. Eg. 2020', `month` int NOT NULL COMMENT 'Number of the month this record belongs to. Eg. 1 for January', `contacts` int NOT NULL COMMENT 'Contactabilidad' DEFAULT 0, `interested` int NOT NULL COMMENT 'Interesados' DEFAULT 0, `quoteAsked` int NOT NULL COMMENT 'Cotización' DEFAULT 0, `creditRequests` json NOT NULL COMMENT 'Solicitudes de crédito', `creditRejections` json NOT NULL COMMENT 'Solicitudes de crédito rechazadas', `creditApprovals` json NOT NULL COMMENT 'Aprobaciones de crédito', `interestedOnCashPayment` int NOT NULL COMMENT 'Interesados en pagos de contado', `paymentPostponed` int NOT NULL COMMENT 'Bajo seguimiento Método de Pago', `diffrentIdSales` int NOT NULL COMMENT 'Ventas con id Diferente', `reservations` json NOT NULL COMMENT 'Reservas', `billed` json NOT NULL COMMENT 'Facturados', `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `dealerId` int NULL, UNIQUE INDEX `IDX_473c243af574d19315e135e3d3` (`year`, `month`, `dealerId`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `ddpFunnels` ADD CONSTRAINT `FK_951e34f255a083c0ddf91569cef` FOREIGN KEY (`dealerId`) REFERENCES `dealer_groups`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `ddpFunnels` DROP FOREIGN KEY `FK_951e34f255a083c0ddf91569cef`", undefined);
        await queryRunner.query("DROP TABLE `ddpFunnels`", undefined);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateT1FunnelsTable1596728108894 implements MigrationInterface {
    name = 'CreateT1FunnelsTable1596728108894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `T1Funnels` (`id` int NOT NULL AUTO_INCREMENT, `year` int NOT NULL COMMENT 'Year this record belongs to. Eg. 2020', `month` int NOT NULL COMMENT 'Number of the month this record belongs to. Eg. 1 for January', `contacts` int NOT NULL COMMENT 'Contactabilidad' DEFAULT 0, `interested` int NOT NULL COMMENT 'Interesados' DEFAULT 0, `quoteAsked` int NOT NULL COMMENT 'Cotización' DEFAULT 0, `creditRequests` json NOT NULL COMMENT 'Solicitudes de crédito', `creditApprovals` json NOT NULL COMMENT 'Aprobaciones de crédito', `interestedOnCashPayment` int NOT NULL COMMENT 'Interesados en pagos de contado', `paymentPostponed` int NOT NULL COMMENT 'Bajo seguimiento Método de Pago', `diffrentIdSales` int NOT NULL COMMENT 'Ventas con id Diferente', `reservations` json NOT NULL COMMENT 'Reservas', `billed` json NOT NULL COMMENT 'Facturados', `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `dealerId` int NULL, UNIQUE INDEX `IDX_t1_funnel_year_month_dealerId` (`year`, `month`, `dealerId`), PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `T1Funnels` ADD CONSTRAINT `FK_t1_funnels_dealer_group_id` FOREIGN KEY (`dealerId`) REFERENCES `dealer_groups`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `T1Funnels` DROP FOREIGN KEY `FK_t1_funnels_dealer_group_id`", undefined);
        await queryRunner.query("DROP INDEX `IDX_t1_funnel_year_month_dealerId` ON `T1Funnels`", undefined);
        await queryRunner.query("DROP TABLE `T1Funnels`", undefined);
    }

}

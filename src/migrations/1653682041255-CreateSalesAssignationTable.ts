import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalesAssignationTable1653682041255
  implements MigrationInterface {
  name = 'CreateSalesAssignationTable1653682041255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `sales_assignations` (`id` int NOT NULL AUTO_INCREMENT, `isActive` tinyint NOT NULL DEFAULT 0, `fromLeadsDate` datetime NOT NULL, `toLeadsDate` datetime NOT NULL, `take120FranchiseSales` tinyint NOT NULL DEFAULT 0, `take120OverallSales` tinyint NOT NULL DEFAULT 0, `take360FranchiseSales` tinyint NOT NULL DEFAULT 0, `take360OverallSales` tinyint NOT NULL DEFAULT 0, `takeXTimeFranchiseSales` tinyint NOT NULL DEFAULT 0, `takeXTimeOverallSales` tinyint NOT NULL DEFAULT 0, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB',
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `sales_assignations`', undefined);
  }
}

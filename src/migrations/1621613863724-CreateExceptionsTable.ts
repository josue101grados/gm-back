import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExceptionsTable1621613863724 implements MigrationInterface {
  name = 'CreateExceptionsTable1621613863724';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE exceptions (
          id int NOT NULL AUTO_INCREMENT, 
          opportunityName varchar(40) NOT NULL, 
          creationDate timestamp NULL COMMENT 'Fecha de creación', 
          estimatedPurchaseDate varchar(255) NULL, 
          normalizedEstimatedPurchaseDate varchar(255) NULL, 
          isFiltered tinyint NULL DEFAULT NULL, 
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
          modelId int NULL, 
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE exceptions 
        ADD CONSTRAINT FK_5fc751d2da47310107b430f9821 
        FOREIGN KEY (modelId) 
        REFERENCES models(id) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION
    `,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE exceptions DROP FOREIGN KEY FK_5fc751d2da47310107b430f9821',
      undefined,
    );
    await queryRunner.query('DROP TABLE exceptions', undefined);
  }
}

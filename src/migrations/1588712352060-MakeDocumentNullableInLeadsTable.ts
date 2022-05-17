import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDocumentNullableInLeadsTable1588712352060
  implements MigrationInterface {
  name = 'MakeDocumentNullableInLeadsTable1588712352060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE leads CHANGE document document varchar(255) NULL COMMENT 'Documento'",
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE leads CHANGE document document varchar(255) NOT NULL COMMENT 'Documento'",
      undefined,
    );
  }
}

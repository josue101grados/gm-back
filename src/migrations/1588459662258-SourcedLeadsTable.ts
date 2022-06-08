import { MigrationInterface, QueryRunner } from 'typeorm';

export class SourcedLeadsTable1588459662258 implements MigrationInterface {
  name = `SourcedLeadsTable1588459662258`;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE sourced_leads (
          id int NOT NULL AUTO_INCREMENT,
          campaignName varchar(255) NOT NULL,
          bac varchar(6) NOT NULL,
          dealerDealershipName varchar(255) NOT NULL,
          modelName varchar(255) NOT NULL,
          document varchar(255) NOT NULL COMMENT 'Documento',
          date timestamp NULL COMMENT 'Fecha Carga API Fuentes',
          status enum ('DESCARTADO', 'CARGADO', 'CLEAN', 'SIEBEL') NOT NULL COMMENT 'Estado del Lead' DEFAULT 'CARGADO',
          duplicated tinyint NOT NULL DEFAULT 0,
          email varchar(255) NULL,
          source varchar(20) NULL,
          externalId varchar(6) NULL COMMENT 'ID Externo',
          names varchar(255) NULL COMMENT 'Nombres',
          lastNames varchar(255) NULL COMMENT 'Apellidos',
          name1 varchar(255) NULL COMMENT 'Nombre1',
          name2 varchar(255) NULL COMMENT 'Nombre2',
          lastName1 varchar(255) NULL COMMENT 'Apellido1',
          lastName2 varchar(255) NULL COMMENT 'Apellido2',
          gender varchar(20) NULL COMMENT 'Género',
          phone varchar(20) NULL COMMENT 'Teléfono',
          workPhone varchar(20) NULL COMMENT 'Teléfono del trabajo',
          mobile varchar(20) NULL COMMENT 'Celular',
          cityName varchar(20) NULL COMMENT 'Ciudad',
          observation varchar(20) NULL COMMENT 'Observaciones',
          conadis varchar(255) NULL,
          estimatedPurchaseDate varchar(255) NULL,
          normalizedEstimatedPurchaseDate varchar(255) NULL,
          otherComments varchar(255) NULL COMMENT 'Comentarios de Fuente',
          externalFormName varchar(255) NULL COMMENT 'Nombre Formulario',
          vin varchar(255) NULL COMMENT 'Nº de Identificación del Vehículo',
          vinIsValid varchar(255) NULL COMMENT 'Vin Válido',
          validateSelfCampaignDuplicates tinyint NOT NULL DEFAULT 0,
          dealerDealershipIsValid tinyint NULL DEFAULT NULL,
          dealerDealershipCityIsValid tinyint NULL DEFAULT NULL,
          documentIsValid tinyint NULL DEFAULT NULL,
          emailIsValid tinyint NULL DEFAULT NULL,
          invalidEmailReason varchar(255) NULL,
          phoneIsValid tinyint NULL DEFAULT NULL,
          nameIsValid tinyint NULL DEFAULT NULL,
          duplicatedDownloadAt timestamp NULL,
          emailSentAt timestamp NULL,
          finalDownloadAt timestamp NULL,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          deletedAt timestamp(6) NULL,
          campaignId int NULL,
          dealerDealershipId int NULL,
          modelId int NULL,
          cityId int NULL,
          INDEX IDX_leads_model (modelName),
          INDEX IDX_leads_document (document),
          INDEX IDX_leads_date (date),
          INDEX IDX_leads_duplicated (duplicated),
          INDEX IDX_leads_email (email),
          INDEX IDX_leads_source (source),
          INDEX IDX_leads_external_id (externalId),
          PRIMARY KEY (id)) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads
      ADD CONSTRAINT FK_17ad9278607673cd79ec4405099 FOREIGN KEY (campaignId)
      REFERENCES campaigns(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads
      ADD CONSTRAINT FK_f281355ca28ed55a0a456cddc5c FOREIGN KEY (dealerDealershipId)
      REFERENCES dealer_dealerships(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads
      ADD CONSTRAINT FK_ec29bfe1ed274e95809cc8d3291 FOREIGN KEY (modelId)
      REFERENCES models(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads
      ADD CONSTRAINT FK_c2b8758b3af78d83350e4543531 FOREIGN KEY (cityId)
      REFERENCES cities(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE sourced_leads DROP FOREIGN KEY FK_c2b8758b3af78d83350e4543531`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads DROP FOREIGN KEY FK_ec29bfe1ed274e95809cc8d3291`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads DROP FOREIGN KEY FK_f281355ca28ed55a0a456cddc5c`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sourced_leads DROP FOREIGN KEY FK_17ad9278607673cd79ec4405099`,
      undefined,
    );

    await queryRunner.query(
      `DROP INDEX IDX_leads_external_id ON sourced_leads`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_leads_source ON sourced_leads`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_leads_email ON sourced_leads`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_leads_duplicated ON sourced_leads`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_leads_date ON sourced_leads`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_leads_document ON sourced_leads`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_leads_model ON sourced_leads`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE sourced_leads`, undefined);
  }
}

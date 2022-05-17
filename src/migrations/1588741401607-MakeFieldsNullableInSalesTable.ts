import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeFieldsNullableInSalesTable1588741401607
  implements MigrationInterface {
  name = 'MakeFieldsNullableInSalesTable1588741401607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE sales CHANGE couponNumber couponNumber varchar(20) NULL COMMENT 'Número del Cupón'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE registerDate registerDate timestamp NOT NULL COMMENT 'Fecha de Registro'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE zoneName zoneName varchar(255) NULL COMMENT 'Zona'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE region region varchar(255) NULL COMMENT 'Región'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE province province varchar(255) NULL COMMENT 'Provincia'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE dealerDealershipName dealerDealershipName varchar(255) NULL COMMENT 'Cuenta'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE dealership dealership varchar(255) NULL COMMENT 'Concesionario'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE dealershipBac dealershipBac varchar(255) NULL COMMENT 'Cuenta BAC'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE zvks zvks varchar(100) NULL COMMENT 'ZVSK'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE my my varchar(10) NULL COMMENT 'MY'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE kmat kmat varchar(100) NULL COMMENT 'KMAT'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE modelName modelName varchar(255) NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE aeade aeade varchar(255) NULL COMMENT 'AEADE'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE segment segment varchar(255) NULL COMMENT 'SEGMENTO'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE family family varchar(255) NULL COMMENT 'FAMILIA'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE vehicleType vehicleType varchar(255) NULL COMMENT 'TIPO DE VEHICULO'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE color color varchar(255) NULL COMMENT 'color'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE keySaleType keySaleType varchar(255) NULL COMMENT 'CLAVE'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE validFleet validFleet varchar(255) NULL COMMENT 'VALID FLOTA'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE financeType financeType varchar(255) NULL COMMENT 'Tipo Financiamiento'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE paymentMethod paymentMethod varchar(255) NULL COMMENT 'Forma de Pago'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE couponStatus couponStatus varchar(20) NULL COMMENT 'Estatus del Cupón'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE retailInvoiceNumber retailInvoiceNumber varchar(30) NULL COMMENT 'Número de la Factura Retail'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE salesType salesType varchar(100) NULL COMMENT 'Tipo de Venta'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE vehicleUse vehicleUse varchar(100) NULL COMMENT 'Uso'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE zone2 zone2 varchar(255) NULL COMMENT 'Zona2'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE createdBy createdBy varchar(255) NULL COMMENT 'Creado por'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE insuranceCompany insuranceCompany varchar(255) NULL COMMENT 'Compañía de Seguros'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE contact contact varchar(255) NULL COMMENT 'Contacto'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE gender gender varchar(20) NULL COMMENT 'Género'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE cityName cityName varchar(255) NULL COMMENT 'Ciudad'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE country country varchar(255) NULL COMMENT 'País'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE nameIsValid nameIsValid tinyint NULL DEFAULT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE phoneIsValid phoneIsValid tinyint NULL DEFAULT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE emailIsValid emailIsValid tinyint NULL DEFAULT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE documentIsValid documentIsValid tinyint NULL DEFAULT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE isValid isValid tinyint NULL DEFAULT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE sales CHANGE isValid isValid tinyint NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE documentIsValid documentIsValid tinyint NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE emailIsValid emailIsValid tinyint NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE phoneIsValid phoneIsValid tinyint NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE nameIsValid nameIsValid tinyint NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE cityName cityName varchar(20) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Ciudad'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE country country varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'País'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE gender gender varchar(20) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Género'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE contact contact varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Contacto'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      CHANGE insuranceCompany insuranceCompany varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Compañía de Seguros'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE createdBy createdBy varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Creado por'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE zone2 zone2 varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Zona2'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE vehicleUse vehicleUse varchar(100) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Uso'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE salesType salesType varchar(100) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Tipo de Venta'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      CHANGE retailInvoiceNumber retailInvoiceNumber varchar(30)
      CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Número de la Factura Retail'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      CHANGE couponStatus couponStatus varchar(20) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Estatus del Cupón'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      CHANGE paymentMethod paymentMethod varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Forma de Pago'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      CHANGE financeType financeType varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Tipo Financiamiento'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE validFleet validFleet varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'VALID FLOTA'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE keySaleType keySaleType varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'CLAVE'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE color color varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'color'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      CHANGE vehicleType vehicleType varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'TIPO DE VEHICULO'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE family family varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'FAMILIA'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE segment segment varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'SEGMENTO'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE aeade aeade varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'AEADE'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE modelName modelName varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE kmat kmat varchar(100) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'KMAT'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE my my varchar(10) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'MY'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE zvks zvks varchar(100) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'ZVSK'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      CHANGE dealershipBac dealershipBac varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Cuenta BAC'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE dealership dealership varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Concesionario'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      CHANGE dealerDealershipName dealerDealershipName varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Cuenta'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE province province varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Provincia'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE region region varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Región'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE zoneName zoneName varchar(255) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Zona'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales CHANGE registerDate registerDate timestamp NULL COMMENT 'Fecha de Registro'`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      CHANGE couponNumber couponNumber varchar(20) CHARACTER SET 'utf8' COLLATE 'utf8_general_ci' NOT NULL COMMENT 'Número del Cupón'`,
      undefined,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class EntitiesTables1588384503625 implements MigrationInterface {
  name = 'Entities1588384503625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // CREATE TABLES
    await queryRunner.query(
      `CREATE TABLE city_aliases (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          cityId int NULL,
          UNIQUE INDEX IDX_city_aliases_name (name),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE campaign_aliases (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          campaignId int NULL,
          UNIQUE INDEX IDX_campaing_aliases_name (name),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE campaigns (
          id int NOT NULL AUTO_INCREMENT,
          code varchar(30) NOT NULL,
          name varchar(255) NOT NULL,
          type varchar(80) NOT NULL,
          source varchar(80) NULL,
          isDdp tinyint NOT NULL DEFAULT 0,
          actionId varchar(30) NULL COMMENT 'ID de acción',
          contentType varchar(60) NULL COMMENT 'Tipo de Contenido',
          validateSelfDuplicates tinyint NOT NULL DEFAULT 0,
          sendFirstContactEmail tinyint NOT NULL DEFAULT 0,
          directsUpload tinyint NOT NULL DEFAULT 1,
          ignoreCampaign tinyint NOT NULL DEFAULT 0,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          UNIQUE INDEX IDX_campaigns_code (code),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE model_aliases (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          modelId int NULL,
          UNIQUE INDEX IDX_model_aliases_name (name),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE zones (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE sales (
          id int NOT NULL AUTO_INCREMENT,
          year int NOT NULL,
          month int NOT NULL,
          vin varchar(255) NOT NULL COMMENT 'Nº de Identificación del Vehículo',
          couponNumber varchar(20) NOT NULL COMMENT 'Número del Cupón',
          validation tinyint NOT NULL COMMENT 'Validación' DEFAULT 0,
          registerDate timestamp NULL COMMENT 'Fecha de Registro',
          zoneName varchar(255) NOT NULL COMMENT 'Zona',
          region varchar(255) NOT NULL COMMENT 'Región',
          province varchar(255) NOT NULL COMMENT 'Provincia',
          dealerDealershipName varchar(255) NOT NULL COMMENT 'Cuenta',
          dealership varchar(255) NOT NULL COMMENT 'Concesionario',
          dealershipBac varchar(255) NOT NULL COMMENT 'Cuenta BAC',
          reportsDate timestamp NULL COMMENT 'Fecha para Reportes',
          days int NULL COMMENT 'DIAS',
          zvks varchar(100) NOT NULL COMMENT 'ZVSK',
          my varchar(10) NOT NULL COMMENT 'MY',
          kmat varchar(100) NOT NULL COMMENT 'KMAT',
          modelName varchar(255) NOT NULL,
          aeade varchar(255) NOT NULL COMMENT 'AEADE',
          segment varchar(255) NOT NULL COMMENT 'SEGMENTO',
          family varchar(255) NOT NULL COMMENT 'FAMILIA',
          vehicleType varchar(255) NOT NULL COMMENT 'TIPO DE VEHICULO',
          color varchar(255) NOT NULL COMMENT 'color',
          keySaleType varchar(255) NOT NULL COMMENT 'CLAVE',
          validFleet varchar(255) NOT NULL COMMENT 'VALID FLOTA',
          cancellationDate timestamp NULL COMMENT 'Fecha de Cancelación',
          retailInvoiceDate timestamp NULL COMMENT 'Fecha de la Factura Retail',
          financeType varchar(255) NOT NULL COMMENT 'Tipo Financiamiento',
          paymentMethod varchar(255) NOT NULL COMMENT 'Forma de Pago',
          leasingFinancial varchar(255) NULL COMMENT 'Cia Leasing / Financiera',
          salesmanDocument varchar(13) NULL COMMENT 'CI Vendedor',
          salesman varchar(255) NULL COMMENT 'Vendedor',
          couponStatus varchar(20) NOT NULL COMMENT 'Estatus del Cupón',
          retailInvoiceNumber varchar(30) NOT NULL COMMENT 'Número de la Factura Retail',
          chevystar tinyint NOT NULL COMMENT 'Chevystar Activado' DEFAULT 0,
          keyFleet varchar(30) NULL COMMENT 'Clave de la Flota',
          netValue decimal(12,2) NULL COMMENT 'Valor Neto',
          totalValue decimal(12,2) NULL COMMENT 'Valor Total',
          salesType varchar(100) NOT NULL COMMENT 'Tipo de Venta',
          vehicleUse varchar(100) NOT NULL COMMENT 'Uso',
          zone2 varchar(255) NOT NULL COMMENT 'Zona2',
          deliveryDate timestamp NULL COMMENT 'Fecha de Entrega',
          createdBy varchar(255) NOT NULL COMMENT 'Creado por',
          createdDate timestamp NULL COMMENT 'Creación: fecha',
          previousVehicleBrand varchar(255) NULL COMMENT 'Marca Vehículo anterior',
          previousVehicleModel varchar(255) NULL COMMENT 'Modelo Vehículo anterior',
          previousVehicleYear int NULL COMMENT 'Año del Vehículo anterior',
          cancellationCause varchar(255) NULL COMMENT 'Causa de la Anulación',
          insuranceCompany varchar(255) NOT NULL COMMENT 'Compañía de Seguros',
          businessName varchar(255) NULL COMMENT 'Razón Social de la Cuenta',
          document varchar(13) NOT NULL COMMENT 'Cédula de Identificación',
          contact varchar(255) NOT NULL COMMENT 'Contacto',
          gender varchar(20) NOT NULL COMMENT 'Género',
          birthDate datetime NULL COMMENT 'Fecha de Nacimiento',
          phone varchar(40) NULL COMMENT 'Teléfono',
          homePhone varchar(40) NULL COMMENT 'Teléfono Residencia',
          mobile varchar(40) NULL COMMENT 'Teléfono Movil',
          address varchar(255) NULL COMMENT 'Address',
          email varchar(255) NULL COMMENT 'E-mail',
          cityName varchar(20) NOT NULL COMMENT 'Ciudad',
          country varchar(255) NOT NULL COMMENT 'País',
          vehicleYear int NULL COMMENT 'Año',
          dealershipCode varchar(100) NULL COMMENT 'Código del Punto de Venta',
          dealershipId varchar(255) NULL COMMENT 'Cuenta: ID exclusivo externo',
          duplicated int NULL COMMENT 'Duplicado',
          name1 varchar(255) NULL COMMENT 'Nombre1',
          name2 varchar(255) NULL COMMENT 'Nombre2',
          lastName1 varchar(255) NULL COMMENT 'Apellido1',
          lastName2 varchar(255) NULL COMMENT 'Apellido2',
          nameIsValid tinyint NULL DEFAULT NULL,
          phoneIsValid tinyint NULL DEFAULT NULL,
          emailIsValid tinyint NULL DEFAULT NULL,
          documentIsValid tinyint NULL DEFAULT NULL,
          invalidEmailReason varchar(255) NULL,
          isValid tinyint NULL DEFAULT NULL,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          zoneId int NULL,
          dealerDealershipId int NULL,
          modelId int NULL,
          cityId int NULL,
          leadId int NULL,
          overallLeadId int NULL,
          INDEX IDX_sales_model (modelName),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE segments (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          ignoreSegment tinyint NOT NULL DEFAULT 0,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          UNIQUE INDEX IDX_segments_name (name),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE models (
          id int NOT NULL AUTO_INCREMENT,
          family varchar(255) NOT NULL,
          model varchar(255) NOT NULL COMMENT 'Modelo',
          image varchar(255) NOT NULL COMMENT 'Imagen',
          additionalImage varchar(255) NULL COMMENT 'Imagen Adicional',
          url varchar(255) NULL,
          price decimal(12,2) NOT NULL,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          segmentId int NULL,
          INDEX IDX_models_family (family),
          INDEX IDX_models_model (model),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE leads (
          id int NOT NULL AUTO_INCREMENT,
          opportunityName varchar(40) NULL,
          campaignName varchar(255) NOT NULL,
          bac varchar(6) NOT NULL,
          dealerDealershipName varchar(255) NOT NULL,
          modelName varchar(255) NOT NULL,
          document varchar(255) NOT NULL COMMENT 'Documento',
          date timestamp NULL COMMENT 'Fecha Carga API Fuentes',
          creationDate timestamp NULL COMMENT 'Fecha de creación',
          status enum ('DESCARTADO', 'CARGADO', 'SIEBEL') NOT NULL COMMENT 'Estado del Lead' DEFAULT 'CARGADO',
          isValid tinyint NOT NULL DEFAULT 1,
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
          saleStageDate timestamp NULL,
          saleStage varchar(255) NULL COMMENT 'Etapa de venta',
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
          parentId int NULL,
          cityId int NULL,
          INDEX IDX_leads_opportunity_name (opportunityName),
          INDEX IDX_leads_model (modelName),
          INDEX IDX_leads_document (document),
          INDEX IDX_leads_date (date),
          INDEX IDX_leads_creation_date (creationDate),
          INDEX IDX_leads_duplicated (duplicated),
          INDEX IDX_leads_email (email),
          INDEX IDX_leads_source (source),
          INDEX IDX_leads_external_id (externalId),
          INDEX IDX_leads_sale_stage (saleStage),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE cities (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          UNIQUE INDEX IDX_cities_name (name),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE dealer_dealership_aliases (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          dealerDealershipId int NULL,
          UNIQUE INDEX IDX_dealer_aliases_name (name),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE visits (
          id int NOT NULL AUTO_INCREMENT,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          userId int NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE tasks (
          id int NOT NULL AUTO_INCREMENT,
          type varchar(50) NOT NULL COMMENT 'Tipo de Tarea',
          status enum ('PENDIENTE','EJECUTANDO','COMPLETADA') NOT NULL COMMENT 'Estado de Tarea' DEFAULT 'PENDIENTE',
          filePath varchar(255) NULL COMMENT 'Url del Archivo Cargado',
          errorsFilePath varchar(1200) NULL COMMENT 'Url del Archivo de Errores',
          data json NULL COMMENT 'Datos Adicionales de Carga',
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          userId int NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE inxait_recovery_emails (
          id int NOT NULL AUTO_INCREMENT,
          dealerDealershipName varchar(255) NOT NULL COMMENT 'Concesionario',
          document varchar(255) NOT NULL COMMENT 'Documento',
          name varchar(255) NOT NULL COMMENT 'Nombre',
          lastName varchar(255) NOT NULL COMMENT 'Apellidos',
          email varchar(255) NULL COMMENT 'Correo electrónico',
          createdAt timestamp(6) NOT NULL COMMENT 'Fecha de Creación' DEFAULT CURRENT_TIMESTAMP(6),
          emailSendAt timestamp NULL COMMENT 'Fecha Envío Email',
          modifiedAt timestamp NULL COMMENT 'Fecha de Modificación',
          downloadedAt timestamp NULL COMMENT 'Fecha de Descarga',
          dealerDealershipId int NULL,
          userId int NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE dealer_dealerships (
          id int NOT NULL AUTO_INCREMENT,
          bac varchar(6) NOT NULL COMMENT 'BAC',
          name varchar(255) NOT NULL COMMENT 'Dealership_Name',
          addressLine1 varchar(255) NULL COMMENT 'Address_Line_1',
          cityName varchar(255) NULL COMMENT 'Ciudad',
          telephone varchar(12) NULL COMMENT 'Telephone',
          siebelReportEmail varchar(255) NULL COMMENT 'Email para notificar Reporte Siebel',
          crmOdEmail varchar(255) NULL COMMENT 'CRM OD Email',
          image varchar(255) NULL COMMENT 'Image',
          whatsapp varchar(255) NULL COMMENT 'Whatsapp',
          urlLocation varchar(255) NULL,
          urlFacebook varchar(255) NULL,
          urlYoutube varchar(255) NULL,
          urlTwitter varchar(255) NULL,
          urlGplus varchar(255) NULL,
          urlInstagram varchar(255) NULL,
          urlWebsite varchar(255) NULL,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          dealerCityId int NULL,
          cityId int NULL,
          UNIQUE INDEX IDX_dealer_dealerships_bac (bac),
          INDEX IDX_dealer_dealerships_name (name),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE old_records (
          id int NOT NULL AUTO_INCREMENT,
          yearMonth varchar(7) NOT NULL,
          won int NOT NULL,
          delivered int NOT NULL,
          dealerCityId int NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE dealer_cities (
          id int NOT NULL AUTO_INCREMENT,
          mainBac varchar(6) NOT NULL COMMENT 'main BAC',
          name varchar(255) NOT NULL COMMENT 'Dealer de Ciudad',
          ignoreDealerCity tinyint NOT NULL DEFAULT 0,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          zoneId int NULL,
          dealerGroupId int NULL,
          UNIQUE INDEX IDX_dealer_cities_name (name),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE generated_reports (
          id int NOT NULL AUTO_INCREMENT,
          date timestamp NULL,
          report varchar(50) NULL,
          path varchar(255) NULL,
          dealerGroupId int NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE dealer_groups (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL COMMENT 'Agrupación',
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          UNIQUE INDEX IDX_dealer_groups_name (name),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE announcements (
          id int NOT NULL AUTO_INCREMENT,
          title varchar(255) NOT NULL,
          description text NULL DEFAULT NULL,
          image varchar(255) NOT NULL COMMENT 'Imagen',
          status enum ('ACTIVO','INACTIVO') NOT NULL COMMENT 'Estado',
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          dealerGroupId int NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE ignored_campaigns (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE estimated_purchase_date_aliases (
          id int NOT NULL AUTO_INCREMENT,
          name varchar(255) NOT NULL,
          alias varchar(255) NOT NULL,
          UNIQUE INDEX IDX_estimated_purchase_date_aliases_alias (alias),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE invalid_phones (
          id int NOT NULL AUTO_INCREMENT,
          phone varchar(255) NOT NULL,
          UNIQUE INDEX IDX_invalid_phones_phone (phone),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE siebel_objectives (
          id int NOT NULL AUTO_INCREMENT,
          color varchar(6) NOT NULL COMMENT 'Color',
          fromPercent decimal(12,4) NOT NULL,
          toPercent decimal(12,4) NOT NULL,
          year int NOT NULL,
          description varchar(255) NOT NULL,
          createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB`,
      undefined,
    );

    // FOREIGN KEYS
    await queryRunner.query(
      `ALTER TABLE city_aliases
      ADD CONSTRAINT FK_dea18538a945a924af6c9f43461 FOREIGN KEY (cityId) REFERENCES cities(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE campaign_aliases
      ADD CONSTRAINT FK_2cb8311d6269168a791d115d1ca FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE model_aliases
      ADD CONSTRAINT FK_6151479d2f123ea04e0e6b59425 FOREIGN KEY (modelId) REFERENCES models(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      ADD CONSTRAINT FK_26f8d4534108538279c46783931 FOREIGN KEY (zoneId) REFERENCES zones(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      ADD CONSTRAINT FK_13ccc00f6336d02706940e6246f FOREIGN KEY (dealerDealershipId)
      REFERENCES dealer_dealerships(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      ADD CONSTRAINT FK_2d39e9b53e83788528f3db7522b FOREIGN KEY (modelId) REFERENCES models(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      ADD CONSTRAINT FK_b69a58d24a452ab76807475b727 FOREIGN KEY (cityId) REFERENCES cities(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      ADD CONSTRAINT FK_105b7088730fe83863aa293a81c FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales
      ADD CONSTRAINT FK_1d4fbf4d5d39ea3aa0805109dc6 FOREIGN KEY (overallLeadId) REFERENCES leads(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE models
      ADD CONSTRAINT FK_b3ad3d582394a7053644293ca56 FOREIGN KEY (segmentId) REFERENCES segments(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads
      ADD CONSTRAINT FK_6873e5924bc699a1a65b4fb099a FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads
      ADD CONSTRAINT FK_a2e1acc9e2795fc9f42dab492b6 FOREIGN KEY (dealerDealershipId)
      REFERENCES dealer_dealerships(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads
      ADD CONSTRAINT FK_3adc091a2aa7f1ef5b2465ed2cb FOREIGN KEY (modelId) REFERENCES models(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads
      ADD CONSTRAINT FK_afbff508ac97b1899720abd6ec7 FOREIGN KEY (parentId) REFERENCES leads(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads
      ADD CONSTRAINT FK_92b810b41f5abcc7f011062f12c FOREIGN KEY (cityId) REFERENCES cities(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_dealership_aliases
      ADD CONSTRAINT FK_1f3249d1ef9564cd1466b0ee217 FOREIGN KEY (dealerDealershipId)
      REFERENCES dealer_dealerships(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE visits
      ADD CONSTRAINT FK_28f19616757b505532162fd6e75 FOREIGN KEY (userId) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE tasks
      ADD CONSTRAINT FK_166bd96559cb38595d392f75a35 FOREIGN KEY (userId) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE inxait_recovery_emails
      ADD CONSTRAINT FK_5d62f6b996756654030930b15cc FOREIGN KEY (dealerDealershipId)
      REFERENCES dealer_dealerships(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE inxait_recovery_emails
      ADD CONSTRAINT FK_3ce784f416ec93c7a370575dbb6 FOREIGN KEY (userId) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_dealerships
      ADD CONSTRAINT FK_bd5d99c56959cc4da51ea5a36f1 FOREIGN KEY (dealerCityId) REFERENCES dealer_cities(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_dealerships
      ADD CONSTRAINT FK_f6a8a85eeab72a942fef4c00b6b FOREIGN KEY (cityId) REFERENCES cities(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE old_records
      ADD CONSTRAINT FK_d0fecf0a92a1880ffdcf3a04e55 FOREIGN KEY (dealerCityId) REFERENCES dealer_cities(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_cities
      ADD CONSTRAINT FK_35d8e66f3e262cccbbefea73611 FOREIGN KEY (zoneId) REFERENCES zones(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_cities
      ADD CONSTRAINT FK_c24a637af3e2cc9537dfcef2c85 FOREIGN KEY (dealerGroupId) REFERENCES dealer_groups(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE generated_reports
      ADD CONSTRAINT FK_ed123d64f290ed50750f9de0b22 FOREIGN KEY (dealerGroupId) REFERENCES dealer_groups(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE announcements
      ADD CONSTRAINT FK_ae4293098e2cba06638b245340c FOREIGN KEY (dealerGroupId) REFERENCES dealer_groups(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // DROP FOREIGN KEYS
    await queryRunner.query(
      `ALTER TABLE announcements DROP FOREIGN KEY FK_ae4293098e2cba06638b245340c`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE generated_reports DROP FOREIGN KEY FK_ed123d64f290ed50750f9de0b22`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_cities DROP FOREIGN KEY FK_c24a637af3e2cc9537dfcef2c85`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_cities DROP FOREIGN KEY FK_35d8e66f3e262cccbbefea73611`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE old_records DROP FOREIGN KEY FK_d0fecf0a92a1880ffdcf3a04e55`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_dealerships DROP FOREIGN KEY FK_f6a8a85eeab72a942fef4c00b6b`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_dealerships DROP FOREIGN KEY FK_bd5d99c56959cc4da51ea5a36f1`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE inxait_recovery_emails DROP FOREIGN KEY FK_3ce784f416ec93c7a370575dbb6`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE inxait_recovery_emails DROP FOREIGN KEY FK_5d62f6b996756654030930b15cc`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE tasks DROP FOREIGN KEY FK_166bd96559cb38595d392f75a35`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE visits DROP FOREIGN KEY FK_28f19616757b505532162fd6e75`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE dealer_dealership_aliases DROP FOREIGN KEY FK_1f3249d1ef9564cd1466b0ee217`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads DROP FOREIGN KEY FK_92b810b41f5abcc7f011062f12c`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads DROP FOREIGN KEY FK_afbff508ac97b1899720abd6ec7`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads DROP FOREIGN KEY FK_3adc091a2aa7f1ef5b2465ed2cb`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads DROP FOREIGN KEY FK_a2e1acc9e2795fc9f42dab492b6`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE leads DROP FOREIGN KEY FK_6873e5924bc699a1a65b4fb099a`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE models DROP FOREIGN KEY FK_b3ad3d582394a7053644293ca56`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales DROP FOREIGN KEY FK_1d4fbf4d5d39ea3aa0805109dc6`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales DROP FOREIGN KEY FK_105b7088730fe83863aa293a81c`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales DROP FOREIGN KEY FK_b69a58d24a452ab76807475b727`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales DROP FOREIGN KEY FK_2d39e9b53e83788528f3db7522b`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales DROP FOREIGN KEY FK_13ccc00f6336d02706940e6246f`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE sales DROP FOREIGN KEY FK_26f8d4534108538279c46783931`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE model_aliases DROP FOREIGN KEY FK_6151479d2f123ea04e0e6b59425`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE campaign_aliases DROP FOREIGN KEY FK_2cb8311d6269168a791d115d1ca`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE city_aliases DROP FOREIGN KEY FK_dea18538a945a924af6c9f43461`,
      undefined,
    );

    // DROP INDEXES
    await queryRunner.query(
      `DROP INDEX IDX_invalid_phones_phone ON invalid_phones`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_estimated_purchase_date_aliases_alias ON estimated_purchase_date_aliases`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_dealer_groups_name ON dealer_groups`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_dealer_groups_name ON dealer_cities`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_dealer_dealerships_name ON dealer_dealerships`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_dealer_dealerships_bac ON dealer_dealerships`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_dealer_aliases_name ON dealer_dealership_aliases`,
      undefined,
    );
    await queryRunner.query(`DROP INDEX IDX_cities_name ON cities`, undefined);
    await queryRunner.query(
      `DROP INDEX IDX_leads_sale_stage ON leads`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_leads_external_id ON leads`,
      undefined,
    );
    await queryRunner.query(`DROP INDEX IDX_leads_source ON leads`, undefined);
    await queryRunner.query(`DROP INDEX IDX_leads_email ON leads`, undefined);
    await queryRunner.query(
      `DROP INDEX IDX_leads_duplicated ON leads`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_leads_creation_date ON leads`,
      undefined,
    );
    await queryRunner.query(`DROP INDEX IDX_leads_date ON leads`, undefined);
    await queryRunner.query(
      `DROP INDEX IDX_leads_document ON leads`,
      undefined,
    );
    await queryRunner.query(`DROP INDEX IDX_leads_model ON leads`, undefined);
    await queryRunner.query(
      `DROP INDEX IDX_leads_opportunity_name ON leads`,
      undefined,
    );
    await queryRunner.query(`DROP INDEX IDX_models_model ON models`, undefined);
    await queryRunner.query(
      `DROP INDEX IDX_models_family ON models`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_segments_name ON segments`,
      undefined,
    );
    await queryRunner.query(`DROP INDEX IDX_sales_model ON sales`, undefined);
    await queryRunner.query(
      `DROP INDEX IDX_model_aliases_name ON model_aliases`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_campaigns_code ON campaigns`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_campaing_aliases_name ON campaign_aliases`,
      undefined,
    );
    await queryRunner.query(
      `DROP INDEX IDX_city_aliases_name ON city_aliases`,
      undefined,
    );

    // DROP TABLES
    await queryRunner.query(
      `DROP TABLE estimated_purchase_date_aliases`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE siebel_objectives`, undefined);
    await queryRunner.query(`DROP TABLE invalid_phones`, undefined);
    await queryRunner.query(`DROP TABLE ignored_campaigns`, undefined);
    await queryRunner.query(`DROP TABLE announcements`, undefined);
    await queryRunner.query(`DROP TABLE dealer_groups`, undefined);
    await queryRunner.query(`DROP TABLE generated_reports`, undefined);
    await queryRunner.query(`DROP TABLE dealer_cities`, undefined);
    await queryRunner.query(`DROP TABLE old_records`, undefined);
    await queryRunner.query(`DROP TABLE dealer_dealerships`, undefined);
    await queryRunner.query(`DROP TABLE inxait_recovery_emails`, undefined);
    await queryRunner.query(`DROP TABLE tasks`, undefined);
    await queryRunner.query(`DROP TABLE visits`, undefined);
    await queryRunner.query(`DROP TABLE dealer_dealership_aliases`, undefined);
    await queryRunner.query(`DROP TABLE cities`, undefined);
    await queryRunner.query(`DROP TABLE leads`, undefined);
    await queryRunner.query(`DROP TABLE models`, undefined);
    await queryRunner.query(`DROP TABLE segments`, undefined);
    await queryRunner.query(`DROP TABLE sales`, undefined);
    await queryRunner.query(`DROP TABLE zones`, undefined);
    await queryRunner.query(`DROP TABLE model_aliases`, undefined);
    await queryRunner.query(`DROP TABLE campaigns`, undefined);
    await queryRunner.query(`DROP TABLE campaign_aliases`, undefined);
    await queryRunner.query(`DROP TABLE city_aliases`, undefined);
  }
}

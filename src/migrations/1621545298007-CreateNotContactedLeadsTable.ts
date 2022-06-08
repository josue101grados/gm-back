import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotContactedLeadsTable1621545298007
  implements MigrationInterface {
  name = 'CreateNotContactedLeadsTable1621545298007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE not_contacted_leads (
        id int NOT NULL AUTO_INCREMENT, 
        year int NOT NULL, 
        month int NOT NULL, 
        bac varchar(6) NOT NULL, 
        dealerGroupId int NOT NULL COMMENT 'Dealer Group al que pertenece este lead no contactado', 
        opportunityName varchar(40) NOT NULL, 
        lastManagementDate timestamp NOT NULL COMMENT 'Fecha última de gestión', 
        lastManagementHour timestamp NOT NULL COMMENT 'Hora última de gestión', 
        satisfactionLevel int NULL COMMENT '¿Qué tan satisfecho se encuentra con la atención recibida por el concesionario? Siendo 0 nada', 
        means varchar(50) NULL COMMENT 'Medio de contacto', 
        timeToTakeContact varchar(255) NULL COMMENT '¿En cuánto tiempo fue contactado?', 
        wantAnotherDealer tinyint NULL COMMENT '¿Desea ser contactado por otro concesionario, para seguir su proceso de compra?' DEFAULT NULL, 
        notContactedReason varchar(255) NULL COMMENT 'Si no desea ser contactado por otro concesionario, entonces ¿Cuál es la razón?', 
        notContacted tinyint NULL COMMENT '¿El cliente quiso no ser contactado?' DEFAULT NULL, 
        daysApart int NULL COMMENT 'Días de diferencia' DEFAULT 0, 
        observations varchar(255) NULL DEFAULT NULL, 
        status enum ('PENDIENTE', 'APROBADO', 'NEGADO') NULL COMMENT 'Estado del Lead No Contactado', 
        justificationDate timestamp NULL COMMENT 'Fecha en la que se justificó' DEFAULT NULL, 
        taskId int NOT NULL COMMENT 'Número de tarea con el cual fue cargada esta información', 
        createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
        updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
        PRIMARY KEY (id, opportunityName)
      ) ENGINE=InnoDB`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE not_contacted_leads_attachments (
        id int NOT NULL AUTO_INCREMENT, 
        filePath varchar(1200) NULL COMMENT 'Url del Archivo Cargado', 
        fileName varchar(100) NOT NULL COMMENT 'Nombre de archivo', 
        status enum ('PENDIENTE', 'APROBADO', 'NEGADO') NULL COMMENT 'Estado del Lead No Contactado', 
        createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
        updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
        opportunityName varchar(255) NOT NULL, 
        PRIMARY KEY (id, opportunityName)
      ) ENGINE=InnoDB`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE not_contacted_leads_attachments',
      undefined,
    );
    await queryRunner.query('DROP TABLE not_contacted_leads', undefined);
  }
}

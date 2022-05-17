import { MigrationInterface, QueryRunner } from 'typeorm';

export class RolesSeeder1599187382308 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('roles')
      .values([
        {
          name: 'callcenter_dealer',
        },
        {
          name: 'supervisor_dealer',
        },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('roles')
      .where('name= :name', {
        name: 'callcenter_dealer',
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('roles')
      .where('name= :name', {
        name: 'supervisor_dealer',
      })
      .execute();
  }
}

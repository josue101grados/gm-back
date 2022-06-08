import { MigrationInterface, QueryRunner } from 'typeorm';

export class RolesSeeder1593488374653 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('roles')
      .values([
        {
          name: 'nodo',
        },
        {
          name: 'autotrain',
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
        name: 'nodo',
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('roles')
      .where('name= :name', {
        name: 'autotrain',
      })
      .execute();
  }
}

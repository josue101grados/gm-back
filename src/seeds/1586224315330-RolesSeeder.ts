import { MigrationInterface, QueryRunner } from 'typeorm';

export class RolesSeeder1586224315330 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('roles')
      .values([
        {
          name: 'admin',
        },
        {
          name: 'gm',
        },
        {
          name: 'dealer',
        },
        {
          name: 'callcenter',
        },
        {
          name: 'carat',
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
        name: 'admin',
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('roles')
      .where('name= :name', {
        name: 'gm',
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('roles')
      .where('name= :name', {
        name: 'dealer',
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('roles')
      .where('name= :name', {
        name: 'callcenter',
      })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('roles')
      .where('name= :name', {
        name: 'carat',
      })
      .execute();
  }
}

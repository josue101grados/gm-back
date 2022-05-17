import { MigrationInterface, QueryRunner } from 'typeorm';
import { hash } from 'bcryptjs';
import { Role } from '../modules/roles/role.entity';
import { User } from '../modules/users/user.entity';

export class UsersSeeder1586224339010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const { manager } = queryRunner;
    await manager
      .createQueryBuilder()
      .insert()
      .into('users')
      .values([
        {
          username: 'smartfie',
          password: await hash('admin', 8),
          email: 'contacto@smartfie.com',
        },
      ])
      .execute();

    const admin = await manager
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.username = :username', { username: 'smartfie' })
      .getOne();

    const adminRole = await manager
      .createQueryBuilder()
      .select('role')
      .from(Role, 'role')
      .where('role.name = :name', { name: 'admin' })
      .getOne();

    await queryRunner.manager
      .createQueryBuilder()
      .relation(User, 'roles')
      .of(admin)
      .add(adminRole);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('users')
      .where('username= :username', {
        username: 'smartfie',
      })
      .execute();
  }
}

import { PrimaryGeneratedColumn, Entity, Column, ManyToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({
  name: 'roles',
})
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(
    type => User,
    user => user.roles,
  )
  users?: User[];
}

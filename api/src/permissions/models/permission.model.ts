import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  BelongsToMany,
} from 'sequelize-typescript';
import { Profile } from '../../profiles/models/profile.model';
import { ProfilePermission } from './profile-permission.model';

@Table({
  tableName: 'permissions',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['name'], where: { deletedAt: null }, name: 'permissions_name_unique' },
    { unique: true, fields: ['slug'], where: { deletedAt: null }, name: 'permissions_slug_unique' }
  ]
})
export class Permission extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @AllowNull(false) @Column(DataType.STRING) name!: string;

  @AllowNull(false) @Column(DataType.STRING) slug!: string;

  @AllowNull(true) @Column(DataType.STRING) description!: string;

  @BelongsToMany(() => Profile, () => ProfilePermission)
  profiles!: Profile[];
}

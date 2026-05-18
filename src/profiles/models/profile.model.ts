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
import { Permission } from '../../permissions/models/permission.model';
import { ProfilePermission } from '../../permissions/models/profile-permission.model';

@Table({
  tableName: 'profiles',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['name'], where: { deletedAt: null }, name: 'profiles_name_unique' }
  ]
})
export class Profile extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @AllowNull(false) @Column(DataType.STRING) name!: string;

  @AllowNull(true) @Column(DataType.STRING) description!: string;

  @BelongsToMany(() => Permission, () => ProfilePermission)
  permissions!: Permission[];
}

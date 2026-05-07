import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
  BelongsToMany,
} from 'sequelize-typescript';
import { Permission } from '../../permissions/models/permission.model';
import { ProfilePermission } from '../../permissions/models/profile-permission.model';

@Table({ tableName: 'profiles', timestamps: true, paranoid: true })
export class Profile extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @Unique @AllowNull(false) @Column(DataType.STRING) name!: string;

  @AllowNull(true) @Column(DataType.STRING) description!: string;

  @BelongsToMany(() => Permission, () => ProfilePermission)
  permissions!: Permission[];
}

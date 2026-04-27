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
import { Profile } from '../../profiles/models/profile.model';
import { ProfilePermission } from './profile-permission.model';

@Table({ tableName: 'Permissions', timestamps: true, paranoid: true })
export class Permission extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @Unique @AllowNull(false) @Column(DataType.STRING) name!: string;

  @Unique @AllowNull(false) @Column(DataType.STRING) slug!: string;

  @AllowNull(true) @Column(DataType.STRING) description!: string;

  @BelongsToMany(() => Profile, () => ProfilePermission)
  profiles!: Profile[];
}

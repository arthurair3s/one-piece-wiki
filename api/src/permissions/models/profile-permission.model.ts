import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Profile } from '../../profiles/models/profile.model';
import { Permission } from './permission.model';

@Table({ tableName: 'profile_permissions', timestamps: true, paranoid: true })
export class ProfilePermission extends Model {
  @ForeignKey(() => Profile)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  profile_id!: number;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  permission_id!: number;
}

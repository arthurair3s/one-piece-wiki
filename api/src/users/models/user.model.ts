import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
} from 'sequelize-typescript';
import { Profile } from '../../profiles/models/profile.model';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['password_hash'] }
  }
})
export class User extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @Unique @AllowNull(false) @Column(DataType.STRING) username!: string;

  @Unique @AllowNull(false) @Column(DataType.STRING) email!: string;

  @AllowNull(false) @Column(DataType.STRING) password_hash!: string;

  @ForeignKey(() => Profile) @AllowNull(false) @Column(DataType.INTEGER) profile_id!: number;

  @BelongsTo(() => Profile) profile!: Profile;
}

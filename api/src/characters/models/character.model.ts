import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  HasMany,
} from 'sequelize-typescript';
import { CharacterVersion } from '../../character-versions/models/character-version.model';

@Table({ tableName: 'characters', timestamps: true, paranoid: true })
export class Character extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @AllowNull(false) @Column(DataType.STRING) name!: string;

  @Unique @AllowNull(false) @Column(DataType.STRING) slug!: string;

  @HasMany(() => CharacterVersion)
  versions!: CharacterVersion[];

  @Column(DataType.VIRTUAL)
  current_status?: string;
}

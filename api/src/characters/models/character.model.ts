import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,

  HasMany,
} from 'sequelize-typescript';
import { CharacterVersion } from '../../character-versions/models/character-version.model';

@Table({
  tableName: 'characters',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['slug'], where: { deletedAt: null }, name: 'characters_slug_unique' }
  ]
})
export class Character extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @AllowNull(false) @Column(DataType.STRING) name!: string;

  @AllowNull(false) @Column(DataType.STRING) slug!: string;

  @HasMany(() => CharacterVersion)
  versions!: CharacterVersion[];

  @Column(DataType.VIRTUAL)
  current_status?: string;
}

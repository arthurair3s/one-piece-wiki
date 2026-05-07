import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
} from 'sequelize-typescript';
import { Character } from '../../characters/models/character.model';
import { Arc } from '../../arcs/models/arc.model';
import { ArcCharacterVersion } from '../../arcs/models/arc-character-version.model';

@Table({ tableName: 'character_versions', timestamps: true, paranoid: true })
export class CharacterVersion extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @ForeignKey(() => Character)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  character_id!: number;

  @BelongsTo(() => Character)
  character!: Character;

  @BelongsToMany(() => Arc, () => ArcCharacterVersion)
  arcs!: Arc[];

  @AllowNull(true) @Column(DataType.STRING) alias!: string;

  @AllowNull(true) @Column(DataType.STRING) epithet!: string;

  @AllowNull(true) @Column(DataType.BIGINT) bounty!: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('ALIVE', 'DECEASED', 'UNKNOWN', 'IMPRISONED'),
    defaultValue: 'ALIVE',
  })
  status!: string;

  @AllowNull(true) @Column(DataType.STRING) image_url!: string;

  @AllowNull(true) @Column(DataType.TEXT) description!: string;
}

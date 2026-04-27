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
} from 'sequelize-typescript';
import { CharacterVersion } from '../../character-versions/models/character-version.model';
import { Island } from '../../islands/models/island.model';

@Table({ tableName: 'IslandCharacterVersions', timestamps: true })
export class IslandCharacterVersion extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @ForeignKey(() => Island)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  island_id!: number;

  @BelongsTo(() => Island)
  island!: Island;

  @ForeignKey(() => CharacterVersion)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  character_version_id!: number;

  @BelongsTo(() => CharacterVersion)
  characterVersion!: CharacterVersion;
}

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { Arc } from './arc.model';
import { Character } from '../../characters/models/character.model';
import { CharacterVersion } from '../../character-versions/models/character-version.model';

@Table({
  tableName: 'arc_character_versions',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['arc_id', 'character_id'], where: { deletedAt: null }, name: 'unique_one_version_per_character_in_arc' }
  ]
})
export class ArcCharacterVersion extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id!: number;

  @ForeignKey(() => Arc)

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  arc_id!: number;

  @ForeignKey(() => CharacterVersion)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  character_version_id!: number;

  @BelongsTo(() => CharacterVersion)
  characterVersion!: CharacterVersion;

  @ForeignKey(() => Character)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  character_id!: number;

  @BelongsTo(() => Character)
  character!: Character;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  order!: number;
}

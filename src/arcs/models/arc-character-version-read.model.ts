import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { ArcRead } from './arc-read.model';
import { CharacterRead } from '../../characters/models/character-read.model';
import { CharacterVersionRead } from '../../character-versions/models/character-version-read.model';

@Table({
  tableName: 'arc_character_versions',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['arc_id', 'character_id'], where: { deletedAt: null }, name: 'unique_one_version_per_character_in_arc_read' }
  ]
})
export class ArcCharacterVersionRead extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
  })
  id!: number;

  @ForeignKey(() => ArcRead)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  arc_id!: number;

  @BelongsTo(() => ArcRead, { foreignKey: 'arc_id', constraints: false })
  arc!: ArcRead;

  @ForeignKey(() => CharacterVersionRead)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  character_version_id!: number;

  @BelongsTo(() => CharacterVersionRead, { foreignKey: 'character_version_id', constraints: false })
  characterVersion!: CharacterVersionRead;

  @ForeignKey(() => CharacterRead)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  character_id!: number;

  @BelongsTo(() => CharacterRead, { foreignKey: 'character_id', constraints: false })
  character!: CharacterRead;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  order!: number;
}

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { CharacterVersionRead } from '../../character-versions/models/character-version-read.model';
import { IslandRead } from '../../islands/models/island-read.model';
import { ArcRead } from '../../arcs/models/arc-read.model';

@Table({
  tableName: 'island_character_versions',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['island_id', 'arc_id', 'order'], where: { deletedAt: null }, name: 'unique_island_arc_order_version_read' }
  ]
})
export class IslandCharacterVersionRead extends Model {
  @PrimaryKey @Column(DataType.INTEGER) id!: number;

  @ForeignKey(() => IslandRead)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  island_id!: number;

  @BelongsTo(() => IslandRead, { constraints: false })
  island!: IslandRead;

  @ForeignKey(() => ArcRead)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  arc_id!: number;

  @BelongsTo(() => ArcRead, { constraints: false })
  arc!: ArcRead;

  @ForeignKey(() => CharacterVersionRead)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  character_version_id!: number;

  @BelongsTo(() => CharacterVersionRead, { constraints: false })
  characterVersion!: CharacterVersionRead;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  order!: number;
}

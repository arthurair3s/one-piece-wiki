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
import { Arc } from '../../arcs/models/arc.model';

@Table({
  tableName: 'island_character_versions',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['island_id', 'arc_id', 'order'], where: { deletedAt: null }, name: 'unique_island_arc_order_version' }
  ]
})
export class IslandCharacterVersion extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @ForeignKey(() => Island)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  island_id!: number;

  @BelongsTo(() => Island)
  island!: Island;

  @ForeignKey(() => Arc)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  arc_id!: number;

  @BelongsTo(() => Arc)
  arc!: Arc;

  @ForeignKey(() => CharacterVersion)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  character_version_id!: number;

  @BelongsTo(() => CharacterVersion)
  characterVersion!: CharacterVersion;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  order!: number;
}

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { ArcRead } from './arc-read.model';
import { IslandRead } from '../../islands/models/island-read.model';
import { EventRead } from '../../events/models/event-read.model';

@Table({
  tableName: 'arc_islands',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['arc_id', 'island_id'], where: { deletedAt: null }, name: 'unique_arc_island_pair_read' }
  ],
})
export class ArcIslandRead extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id!: number;

  @ForeignKey(() => ArcRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  arc_id!: number;

  @BelongsTo(() => ArcRead, { constraints: false })
  arc!: ArcRead;

  @ForeignKey(() => IslandRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  island_id!: number;

  @BelongsTo(() => IslandRead, { constraints: false })
  island!: IslandRead;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  order!: number;

  @HasMany(() => EventRead, { constraints: false })
  events!: EventRead[];
}

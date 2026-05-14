import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';

import { IslandRead } from '../../islands/models/island-read.model';
import { ArcIslandRead } from './arc-island-read.model';

@Table({
  tableName: 'arcs',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['order', 'saga_id'], where: { deletedAt: null }, name: 'unique_arc_order_per_saga_read' }
  ]
})
export class ArcRead extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  saga_id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  order!: number;

  @BelongsToMany(() => IslandRead, () => ArcIslandRead)
  islands!: IslandRead[];
}

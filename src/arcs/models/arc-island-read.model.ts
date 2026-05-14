import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';
import { ArcRead } from './arc-read.model';
import { IslandRead } from '../../islands/models/island-read.model';

@Table({
  tableName: 'arc_islands',
  timestamps: true,
  paranoid: true,
})
export class ArcIslandRead extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id!: number;

  @ForeignKey(() => ArcRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  arc_id!: number;

  @ForeignKey(() => IslandRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  island_id!: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  order!: number;
}

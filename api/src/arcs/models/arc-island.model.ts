import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';
import { Arc } from './arc.model';
import { Island } from '../../islands/models/island.model';

@Table({
  tableName: 'arc_islands',
  timestamps: true,
  paranoid: true,
})
export class ArcIsland extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id!: number;

  @ForeignKey(() => Arc)
  @Column({ type: DataType.INTEGER, allowNull: false })
  arc_id!: number;

  @ForeignKey(() => Island)
  @Column({ type: DataType.INTEGER, allowNull: false })
  island_id!: number;

  // ordem da ilha dentro do contexto desse arco específico
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  order!: number;
}

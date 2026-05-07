import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Arc } from './arc.model';
import { Island } from '../../islands/models/island.model';

@Table({
  tableName: 'arc_islands',
  timestamps: true,
  paranoid: true,
})
export class ArcIsland extends Model {
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

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';

import { ArcRead } from '../../arcs/models/arc-read.model';
import { ArcIslandRead } from '../../arcs/models/arc-island-read.model';

@Table({
  tableName: 'islands',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['name'], where: { deletedAt: null }, name: 'islands_name_unique_read' }
  ]
})
export class IslandRead extends Model {
  @Column({ primaryKey: true, type: DataType.INTEGER })
  id!: number;

  @Column({ allowNull: false })
  name!: string;

  @Column({ allowNull: false, type: DataType.TEXT })
  description!: string;

  @Column({ allowNull: false, type: DataType.FLOAT })
  coordinate_x!: number;

  @Column({ allowNull: false, type: DataType.FLOAT })
  coordinate_y!: number;

  @Column({ allowNull: false, type: DataType.FLOAT })
  coordinate_z!: number;

  @Column({ allowNull: false })
  model_url!: string;

  @Column
  thumbnail_url?: string;

  @Column({ defaultValue: true })
  is_active!: boolean;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: -180.0 })
  rotation_y!: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 1.0 })
  scale!: number;

  @BelongsToMany(() => ArcRead, { through: () => ArcIslandRead, constraints: false })
  arcs!: ArcRead[];
}

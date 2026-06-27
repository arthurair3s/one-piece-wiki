import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';

import { Optional } from 'sequelize';
import { Arc } from '../../arcs/models/arc.model';
import { ArcIsland } from '../../arcs/models/arc-island.model';

interface IslandAttributes {
  id: number;
  name: string;
  description: string;
  coordinate_x: number;
  coordinate_y: number;
  coordinate_z: number;
  model_url: string;
  thumbnail_url?: string;
  is_active: boolean;
  rotation_y: number;
  scale: number;
}

interface IslandCreationAttributes
  extends Optional<IslandAttributes, 'id' | 'thumbnail_url' | 'is_active' | 'rotation_y' | 'scale'> {}

@Table({
  tableName: 'islands',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['name'], where: { deletedAt: null }, name: 'islands_name_unique' }
  ]
})
export class Island extends Model<
  IslandAttributes,
  IslandCreationAttributes
> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id!: number;

  @Column({ allowNull: false })
  name!: string;

  @Column({ allowNull: false, type: DataType.TEXT })
  description!: string;

  @Column({ allowNull: false })
  coordinate_x!: number;

  @Column({ allowNull: false })
  coordinate_y!: number;

  @Column({ allowNull: false })
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

  // ilha pode pertencer a múltiplos arcos (entidade geográfica global)
  @BelongsToMany(() => Arc, () => ArcIsland)
  arcs!: Arc[];
}
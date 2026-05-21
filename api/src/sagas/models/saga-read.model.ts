import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';

import { ArcRead } from '../../arcs/models/arc-read.model';

@Table({
  tableName: 'sagas',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['name'], where: { deletedAt: null }, name: 'sagas_name_unique_read' },
    { unique: true, fields: ['order'], where: { deletedAt: null }, name: 'sagas_order_unique_read' }
  ]
})
export class SagaRead extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  order!: number;

  @HasMany(() => ArcRead, { constraints: false, foreignKey: 'saga_id' })
  arcs!: ArcRead[];
}

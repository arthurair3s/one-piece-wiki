import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';

import { Optional } from 'sequelize';
import { Arc } from '../../arcs/models/arc.model';

interface SagaAttributes {
  id: number;
  name: string;
  description?: string;
  order: number;
}


interface SagaCreationAttributes
  extends Optional<SagaAttributes, 'id'> {}

@Table({
  tableName: 'sagas',
  timestamps: true,
  paranoid: true,
})
export class Saga extends Model<SagaAttributes, SagaCreationAttributes> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
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
    unique: true,
  })
  order!: number;

  @HasMany(() => Arc)
  arcs!: Arc[];
}
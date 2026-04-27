import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';

import { Optional } from 'sequelize';
import { Arc } from 'src/arcs/models/arc.model';

interface SagaAttributes {
  id: number;
  name: string;
  order: number;
}

interface SagaCreationAttributes
  extends Optional<SagaAttributes, 'id'> {}

@Table({
  tableName: 'sagas',
  timestamps: false,
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
  })
  name!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  order!: number;

  @HasMany(() => Arc)
  arcs!: Arc[];
}
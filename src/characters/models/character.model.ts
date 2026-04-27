import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'Characters', timestamps: true, paranoid: true })
export class Character extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @AllowNull(false) @Column(DataType.STRING) name!: string;

  @Unique @AllowNull(false) @Column(DataType.STRING) slug!: string;
}

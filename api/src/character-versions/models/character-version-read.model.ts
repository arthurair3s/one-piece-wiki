import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { CharacterRead } from '../../characters/models/character-read.model';

@Table({ tableName: 'character_versions', timestamps: true, paranoid: true })
export class CharacterVersionRead extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  id!: number;

  @ForeignKey(() => CharacterRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  character_id!: number;

  @BelongsTo(() => CharacterRead, { foreignKey: 'character_id', constraints: false })
  character!: CharacterRead;

  @Column({ type: DataType.STRING, allowNull: true }) 
  alias!: string;

  @Column({ type: DataType.STRING, allowNull: true }) 
  epithet!: string;

  @Column({ type: DataType.BIGINT, allowNull: true }) 
  bounty!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'ALIVE',
  })
  status!: string;

  @Column({ type: DataType.STRING, allowNull: true }) 
  image_url!: string;

  @Column({ type: DataType.TEXT, allowNull: true }) 
  description!: string;
}

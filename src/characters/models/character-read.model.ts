import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { CharacterVersionRead } from '../../character-versions/models/character-version-read.model';

@Table({
  tableName: 'character_reads',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['slug'], where: { deletedAt: null }, name: 'characters_slug_unique_read' }
  ]
})
export class CharacterRead extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  slug!: string;

  @HasMany(() => CharacterVersionRead, { constraints: false })
  versions!: CharacterVersionRead[];
}

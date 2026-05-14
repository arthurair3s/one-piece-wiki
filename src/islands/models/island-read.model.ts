import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';

import { ArcRead } from '../../arcs/models/arc-read.model';
import { ArcIslandRead } from '../../arcs/models/arc-island-read.model';
import { CharacterVersionRead } from '../../character-versions/models/character-version-read.model';
import { IslandCharacterVersionRead } from '../../island-character-versions/models/island-character-version-read.model';
import { EventRead } from '../../events/models/event-read.model';

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

  @BelongsToMany(() => ArcRead, { through: () => ArcIslandRead, constraints: false })
  arcs!: ArcRead[];

  @BelongsToMany(() => CharacterVersionRead, { through: () => IslandCharacterVersionRead, constraints: false })
  character_versions!: CharacterVersionRead[];

  @HasMany(() => EventRead, { constraints: false })
  events!: EventRead[];

  @HasMany(() => IslandCharacterVersionRead, { constraints: false })
  island_character_versions!: IslandCharacterVersionRead[];
}

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';

import { Optional } from 'sequelize';
import { Arc } from '../../arcs/models/arc.model';
import { ArcIsland } from '../../arcs/models/arc-island.model';
import { CharacterVersion } from '../../character-versions/models/character-version.model';
import { IslandCharacterVersion } from '../../island-character-versions/models/island-character-version.model';
import { Event } from '../../events/models/event.model';

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
}

interface IslandCreationAttributes
  extends Optional<IslandAttributes, 'id' | 'thumbnail_url' | 'is_active'> {}

@Table({
  tableName: 'islands',
  timestamps: true,
  paranoid: true,
})
export class Island extends Model<
  IslandAttributes,
  IslandCreationAttributes
> {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id!: number;

  @Column({ allowNull: false, unique: true })
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

  // ilha pode pertencer a múltiplos arcos (entidade geográfica global)
  @BelongsToMany(() => Arc, () => ArcIsland)
  arcs!: Arc[];

  @BelongsToMany(() => CharacterVersion, () => IslandCharacterVersion)
  character_versions!: CharacterVersion[];

  @HasMany(() => Event)
  events!: Event[];

  @HasMany(() => IslandCharacterVersion)
  island_character_versions!: IslandCharacterVersion[];
}
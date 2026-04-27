import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
} from 'sequelize-typescript';

import { Optional } from 'sequelize';
import { Arc } from 'src/arcs/models/arc.model';
import { CharacterVersion } from 'src/character-versions/models/character-version.model';
import { IslandCharacterVersion } from 'src/island-character-versions/models/island-character-version.model';
import { HasMany } from 'sequelize-typescript';
import { Event } from 'src/events/models/event.model';

interface IslandAttributes {
  id: number;
  name: string;
  description: string;
  arc_id: number;
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
  timestamps: false,
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

  @ForeignKey(() => Arc)
  @Column({ allowNull: false })
  arc_id!: number;

  @BelongsTo(() => Arc)
  arc!: Arc;

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

  @BelongsToMany(() => CharacterVersion, () => IslandCharacterVersion)
  character_versions!: CharacterVersion[];

  @HasMany(() => Event)
  events!: Event[];
}
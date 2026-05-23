import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
} from 'sequelize-typescript';
import { ArcIsland } from '../../arcs/models/arc-island.model';
import { CharacterVersion } from '../../character-versions/models/character-version.model';
import { EventParticipant } from './event-participant.model';

@Table({
  tableName: 'events',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['arc_island_id', 'order'], where: { deletedAt: null }, name: 'unique_event_order_context' }
  ]
})
export class Event extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) id!: number;

  @ForeignKey(() => ArcIsland)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  arc_island_id!: number;

  @BelongsTo(() => ArcIsland)
  arcIsland!: ArcIsland;

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  type!: string;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  order!: number;

  // personagens (por versão) que participaram deste evento
  @BelongsToMany(() => CharacterVersion, () => EventParticipant)
  participants!: CharacterVersion[];
}

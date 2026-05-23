import { Column, DataType, Model, Table, BelongsToMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { CharacterVersionRead } from '../../character-versions/models/character-version-read.model';
import { EventParticipantRead } from './event-participant-read.model';

import { ArcIslandRead } from '../../arcs/models/arc-island-read.model';

@Table({
  tableName: 'events',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['arc_island_id', 'order'], where: { deletedAt: null }, name: 'unique_event_order_context_read' }
  ]
})
export class EventRead extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  id!: number;

  @ForeignKey(() => ArcIslandRead)
  @Column(DataType.INTEGER)
  arc_island_id!: number;

  @BelongsTo(() => ArcIslandRead, { constraints: false })
  arcIsland!: ArcIslandRead;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  order!: number;

  // Personagens (por versão) que participaram deste evento.
  @BelongsToMany(() => CharacterVersionRead, {
    through: () => EventParticipantRead,
    foreignKey: 'event_id',
    otherKey: 'character_version_id',
    constraints: false
  })
  participants!: CharacterVersionRead[];
}

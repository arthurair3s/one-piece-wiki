import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { EventRead } from './event-read.model';
import { CharacterVersionRead } from '../../character-versions/models/character-version-read.model';
import { CharacterRead } from '../../characters/models/character-read.model';

@Table({
  tableName: 'event_participants',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['event_id', 'character_id'], where: { deletedAt: null }, name: 'unique_event_participant_read' }
  ]
})
export class EventParticipantRead extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  id!: number;

  @ForeignKey(() => EventRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  event_id!: number;

  @BelongsTo(() => EventRead, { constraints: false })
  event!: EventRead;

  @ForeignKey(() => CharacterVersionRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  character_version_id!: number;

  @BelongsTo(() => CharacterVersionRead, { constraints: false })
  characterVersion!: CharacterVersionRead;

  @ForeignKey(() => CharacterRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  character_id!: number;

  @BelongsTo(() => CharacterRead, { constraints: false })
  character!: CharacterRead;
}

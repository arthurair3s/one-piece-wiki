import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { EventRead } from './event-read.model';
import { CharacterVersionRead } from '../../character-versions/models/character-version-read.model';

@Table({
  tableName: 'event_participants',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['event_id', 'character_version_id'], where: { deletedAt: null }, name: 'unique_event_participant_read' }
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

  @ForeignKey(() => CharacterVersionRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  character_version_id!: number;
}

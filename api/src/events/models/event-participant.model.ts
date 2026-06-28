import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';
import { Event } from './event.model';
import { CharacterVersion } from '../../character-versions/models/character-version.model';

@Table({
  tableName: 'event_participants',
  timestamps: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['event_id', 'character_version_id'], where: { deletedAt: null }, name: 'unique_event_participant' }
  ]
})
export class EventParticipant extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id!: number;

  @ForeignKey(() => Event)

  @Column({ type: DataType.INTEGER, allowNull: false })
  event_id!: number;

  @ForeignKey(() => CharacterVersion)
  @Column({ type: DataType.INTEGER, allowNull: false })
  character_version_id!: number;
}

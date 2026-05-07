import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Event } from './event.model';
import { CharacterVersion } from '../../character-versions/models/character-version.model';

@Table({
  tableName: 'event_participants',
  timestamps: true,
  paranoid: true,
})
export class EventParticipant extends Model {
  @ForeignKey(() => Event)
  @Column({ type: DataType.INTEGER, allowNull: false })
  event_id!: number;

  @ForeignKey(() => CharacterVersion)
  @Column({ type: DataType.INTEGER, allowNull: false })
  character_version_id!: number;
}

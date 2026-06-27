import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  BelongsToMany,
  ForeignKey,
} from 'sequelize-typescript';
import { CharacterRead } from '../../characters/models/character-read.model';
import { ArcRead } from '../../arcs/models/arc-read.model';
import { ArcCharacterVersionRead } from '../../arcs/models/arc-character-version-read.model';
import { EventRead } from '../../events/models/event-read.model';
import { EventParticipantRead } from '../../events/models/event-participant-read.model';

@Table({ tableName: 'character_versions', timestamps: true, paranoid: true })
export class CharacterVersionRead extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  id!: number;

  @ForeignKey(() => CharacterRead)
  @Column({ type: DataType.INTEGER, allowNull: false })
  character_id!: number;

  @BelongsTo(() => CharacterRead, { foreignKey: 'character_id', constraints: false })
  character!: CharacterRead;

  @Column({ type: DataType.STRING, allowNull: true })
  alias!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  epithet!: string;

  @Column({ type: DataType.BIGINT, allowNull: true })
  bounty!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'ALIVE',
  })
  status!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  image_url!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string;

  @BelongsToMany(() => ArcRead, { through: () => ArcCharacterVersionRead, foreignKey: 'character_version_id', otherKey: 'arc_id', constraints: false })
  arcs!: ArcRead[];

  @BelongsToMany(() => EventRead, { through: () => EventParticipantRead, foreignKey: 'character_version_id', otherKey: 'event_id', constraints: false })
  events!: EventRead[];
}

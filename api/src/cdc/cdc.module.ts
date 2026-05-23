import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CdcController } from './cdc.controller';
import { CdcService } from './cdc.service';
import { EventRead } from '../events/models/event-read.model';
import { EventParticipantRead } from '../events/models/event-participant-read.model';
import { CharacterVersionRead } from '../character-versions/models/character-version-read.model';
import { CharacterRead } from '../characters/models/character-read.model';
import { IslandRead } from '../islands/models/island-read.model';
import { ArcRead } from '../arcs/models/arc-read.model';
import { ArcIslandRead } from '../arcs/models/arc-island-read.model';
import { ArcCharacterVersionRead } from '../arcs/models/arc-character-version-read.model';
import { SagaRead } from '../sagas/models/saga-read.model';
@Module({
  imports: [
    SequelizeModule.forFeature([
      EventRead,
      EventParticipantRead,
      CharacterVersionRead,
      CharacterRead,
      IslandRead,
      ArcRead,
      ArcIslandRead,
      SagaRead,
      ArcCharacterVersionRead,
    ], 'read-db')
  ],
  controllers: [CdcController],
  providers: [CdcService],
})
export class CdcModule { }

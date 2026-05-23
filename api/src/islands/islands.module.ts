import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CqrsModule } from '@nestjs/cqrs';

import { IslandsController } from './islands.controller';
import { IslandsService } from './islands.service';

import { Island } from './models/island.model';
import { IslandRead } from './models/island-read.model';
import { Arc } from '../arcs/models/arc.model';
import { ArcRead } from '../arcs/models/arc-read.model';
import { ArcIsland } from '../arcs/models/arc-island.model';
import { ArcIslandRead } from '../arcs/models/arc-island-read.model';
import { CharacterVersion } from '../character-versions/models/character-version.model';
import { CharacterVersionRead } from '../character-versions/models/character-version-read.model';
import { Character } from '../characters/models/character.model';
import { CharacterRead } from '../characters/models/character-read.model';
import { ArcCharacterVersionRead } from '../arcs/models/arc-character-version-read.model';
import { EventRead } from '../events/models/event-read.model';

import { CreateIslandHandler } from './commands/handlers/create-island.handler';
import { CreateIslandsBulkHandler } from './commands/handlers/create-islands-bulk.handler';
import { UpdateIslandHandler } from './commands/handlers/update-island.handler';
import { DeleteIslandHandler } from './commands/handlers/delete-island.handler';

import { GetIslandDetailsHandler } from './queries/handlers/get-island-details.handler';
import { GetIslandsHandler } from './queries/handlers/get-islands.handler';
import { GetIslandArcsHandler } from './queries/handlers/get-island-arcs.handler';
import { GetIslandsMapHandler } from './queries/handlers/get-islands-map.handler';


const CommandHandlers = [
  CreateIslandHandler,
  CreateIslandsBulkHandler,
  UpdateIslandHandler,
  DeleteIslandHandler, 
];

const QueryHandlers = [
  GetIslandDetailsHandler,
  GetIslandsHandler,
  GetIslandArcsHandler,
  GetIslandsMapHandler,
];

@Module({
  imports: [
    CqrsModule,
    SequelizeModule.forFeature([
      Island,
      Arc,
      ArcIsland,
      CharacterVersion,
      Character,
    ]),
    SequelizeModule.forFeature([
      IslandRead,
      ArcRead,
      ArcIslandRead,
      CharacterVersionRead,
      CharacterRead,
      EventRead,
      ArcCharacterVersionRead,
    ], 'read-db'),
  ],
  controllers: [IslandsController],
  providers: [
    IslandsService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class IslandsModule {}
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CqrsModule } from '@nestjs/cqrs';

import { IslandsController } from './islands.controller';
import { IslandsService } from './islands.service';

import { Island } from './models/island.model';
import { Arc } from '../arcs/models/arc.model';
import { ArcIsland } from '../arcs/models/arc-island.model';
import { CharacterVersion } from '../character-versions/models/character-version.model';
import { Character } from '../characters/models/character.model';
import { IslandCharacterVersion } from '../island-character-versions/models/island-character-version.model';

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
      IslandCharacterVersion,
    ]),
  ],
  controllers: [IslandsController],
  providers: [
    IslandsService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class IslandsModule {}
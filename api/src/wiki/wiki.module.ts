import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { WikiController } from './wiki.controller';

// Read Models
import { IslandRead } from '../islands/models/island-read.model';
import { ArcRead } from '../arcs/models/arc-read.model';
import { ArcIslandRead } from '../arcs/models/arc-island-read.model';
import { SagaRead } from '../sagas/models/saga-read.model';
import { ArcCharacterVersionRead } from '../arcs/models/arc-character-version-read.model';
import { CharacterVersionRead } from '../character-versions/models/character-version-read.model';
import { CharacterRead } from '../characters/models/character-read.model';
import { EventRead } from '../events/models/event-read.model';

// Query Handlers
import { GetWikiSagasHandler } from './queries/handlers/get-wiki-sagas.handler';
import { GetWikiArcsHandler } from './queries/handlers/get-wiki-arcs.handler';
import { GetWikiMapHandler } from './queries/handlers/get-wiki-map.handler';
import { GetWikiMapFilteredHandler } from './queries/handlers/get-wiki-map-filtered.handler';
import { GetWikiIslandHandler } from './queries/handlers/get-wiki-island.handler';
import { GetWikiIslandArcHandler } from './queries/handlers/get-wiki-island-arc.handler';

const QueryHandlers = [
  GetWikiSagasHandler,
  GetWikiArcsHandler,
  GetWikiMapHandler,
  GetWikiMapFilteredHandler,
  GetWikiIslandHandler,
  GetWikiIslandArcHandler,
];

@Module({
  imports: [
    CqrsModule,
    SequelizeModule.forFeature(
      [
        IslandRead,
        ArcRead,
        ArcIslandRead,
        SagaRead,
        ArcCharacterVersionRead,
        CharacterVersionRead,
        CharacterRead,
        EventRead,
      ],
      'read-db',
    ),
  ],
  controllers: [WikiController],
  providers: [...QueryHandlers],
})
export class WikiModule {}

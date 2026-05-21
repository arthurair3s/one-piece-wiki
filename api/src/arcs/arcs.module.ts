import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';

import { Arc } from './models/arc.model';
import { Saga } from '../sagas/models/saga.model';
import { Island } from '../islands/models/island.model';
import { ArcIsland } from './models/arc-island.model';
import { ArcCharacterVersion } from './models/arc-character-version.model';

import { ArcsService } from './arcs.service';
import { ArcsController } from './arcs.controller';

import { CreateArcHandler } from './commands/handlers/create-arc.handler';
import { CreateArcsBulkHandler } from './commands/handlers/create-arcs-bulk.handler';
import { UpdateArcHandler } from './commands/handlers/update-arc.handler';
import { DeleteArcHandler } from './commands/handlers/delete-arc.handler';

import { GetArcsHandler } from './queries/handlers/get-arcs.handler';
import { GetArcByIdHandler } from './queries/handlers/get-arc-by-id.handler';

const CommandHandlers = [
  CreateArcHandler,
  CreateArcsBulkHandler,
  UpdateArcHandler,
  DeleteArcHandler,
];

const QueryHandlers = [
  GetArcsHandler,
  GetArcByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    SequelizeModule.forFeature([Arc, Saga, Island, ArcIsland, ArcCharacterVersion]),
  ],
  controllers: [ArcsController],
  providers: [
    ArcsService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ArcsService],
})
export class ArcsModule {}
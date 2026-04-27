import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';

import { Arc } from './models/arc.model';
import { Saga } from 'src/sagas/models/saga.model';
import { Island } from 'src/islands/models/island.model';

import { ArcsService } from './arcs.service';
import { ArcsController } from './arcs.controller';

import { CreateArcHandler } from './commands/handlers/create-arc.handler';
import { UpdateArcHandler } from './commands/handlers/update-arc.handler';
import { DeleteArcHandler } from './commands/handlers/delete-arc.handler';

import { GetArcsHandler } from './queries/handlers/get-arcs.handler';
import { GetArcByIdHandler } from './queries/handlers/get-arc-by-id.handler';

const CommandHandlers = [
  CreateArcHandler,
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
    SequelizeModule.forFeature([Arc, Saga, Island]),
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
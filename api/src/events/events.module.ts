import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventRead } from './models/event-read.model';
import { EventParticipantRead } from './models/event-participant-read.model';
import { CharacterVersionRead } from '../character-versions/models/character-version-read.model';
import { CharacterRead } from '../characters/models/character-read.model';

import { Event } from './models/event.model';
import { EventParticipant } from './models/event-participant.model';
import { Island } from '../islands/models/island.model';
import { CharacterVersion } from '../character-versions/models/character-version.model';
import { Character } from '../characters/models/character.model';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

import { CreateEventHandler } from './commands/handlers/create-event.handler';
import { CreateEventsBulkHandler } from './commands/handlers/create-events-bulk.handler';
import { UpdateEventHandler } from './commands/handlers/update-event.handler';
import { DeleteEventHandler } from './commands/handlers/delete-event.handler';
import { AddParticipantToEventHandler } from './commands/handlers/add-participant-to-event.handler';
import { RemoveParticipantFromEventHandler } from './commands/handlers/remove-participant-from-event.handler';
import { GetEventsHandler } from './queries/handlers/get-events.handler';
import { GetEventByIdHandler } from './queries/handlers/get-event-by-id.handler';
import { GetEventParticipantsHandler } from './queries/handlers/get-event-participants.handler';

const CommandHandlers = [
  CreateEventHandler,
  CreateEventsBulkHandler,
  UpdateEventHandler,
  DeleteEventHandler,
  AddParticipantToEventHandler,
  RemoveParticipantFromEventHandler,
];

const QueryHandlers = [
  GetEventsHandler,
  GetEventByIdHandler,
  GetEventParticipantsHandler,
];

@Module({
  imports: [
    CqrsModule,
    SequelizeModule.forFeature([Event, EventParticipant, Island, CharacterVersion, Character]),
    SequelizeModule.forFeature([EventRead, EventParticipantRead, CharacterVersionRead, CharacterRead], 'read-db'),
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [EventsService],
})
export class EventsModule { }

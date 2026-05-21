import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { EventFilterDto } from './dtos/event-filter.dto';

import { CreateEventCommand } from './commands/impl/create-event.command';
import { CreateEventsBulkCommand } from './commands/impl/create-events-bulk.command';
import { UpdateEventCommand } from './commands/impl/update-event.command';
import { DeleteEventCommand } from './commands/impl/delete-event.command';
import { AddParticipantToEventCommand } from './commands/impl/add-participant-to-event.command';
import { RemoveParticipantFromEventCommand } from './commands/impl/remove-participant-from-event.command';
import { GetEventsQuery } from './queries/impl/get-events.query';
import { GetEventByIdQuery } from './queries/impl/get-event-by-id.query';
import { GetEventParticipantsQuery } from './queries/impl/get-event-participants.query';

@Injectable()
export class EventsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  create(dto: CreateEventDto) {
    return this.commandBus.execute(
      new CreateEventCommand(dto.island_id, dto.arc_id, dto.title, dto.type, dto.description, dto.order)
    );
  }

  createBulk(dtos: CreateEventDto[]) {
    return this.commandBus.execute(
      new CreateEventsBulkCommand(dtos)
    );
  }

  findAll(query: EventFilterDto) {
    return this.queryBus.execute(
      new GetEventsQuery(query.page, query.limit, query.island_id, query.type)
    );
  }

  findOne(id: number) {
    return this.queryBus.execute(new GetEventByIdQuery(id));
  }

  update(id: number, dto: UpdateEventDto) {
    return this.commandBus.execute(
      new UpdateEventCommand(id, dto.island_id, dto.title, dto.type, dto.description, dto.arc_id, dto.order)
    );
  }

  remove(id: number) {
    return this.commandBus.execute(new DeleteEventCommand(id));
  }

  addParticipant(event_id: number, character_version_id: number) {
    return this.commandBus.execute(
      new AddParticipantToEventCommand(event_id, character_version_id)
    );
  }

  removeParticipant(event_id: number, character_version_id: number) {
    return this.commandBus.execute(
      new RemoveParticipantFromEventCommand(event_id, character_version_id)
    );
  }

  getParticipants(event_id: number) {
    return this.queryBus.execute(new GetEventParticipantsQuery(event_id));
  }
}


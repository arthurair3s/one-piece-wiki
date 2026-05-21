import { CreateEventDto } from '../../dtos/create-event.dto';

export class CreateEventsBulkCommand {
  constructor(public readonly events: CreateEventDto[]) {}
}

import { CreateIslandDto } from '../../dtos/create-island.dto';

export class CreateIslandsBulkCommand {
  constructor(public readonly islands: CreateIslandDto[]) {}
}

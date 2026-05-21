import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddCharacterToIslandCommand } from './commands/impl/add-character-to-island.command';
import { RemoveCharacterFromIslandCommand } from './commands/impl/remove-character-from-island.command';
import { GetCharactersByIslandQuery } from './queries/impl/get-characters-by-island.query';
import { AddCharacterToIslandDto } from './dtos/add-character-to-island.dto';
import { IslandCharacterFilterDto } from './dtos/island-character-filter.dto';

@Injectable()
export class IslandCharacterVersionsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  addCharacterToIsland(data: AddCharacterToIslandDto) {
    return this.commandBus.execute(new AddCharacterToIslandCommand(data));
  }

  removeCharacterFromIsland(island_id: number, character_version_id: number) {
    return this.commandBus.execute(new RemoveCharacterFromIslandCommand(island_id, character_version_id));
  }

  getCharactersByIsland(filters: IslandCharacterFilterDto) {
    return this.queryBus.execute(new GetCharactersByIslandQuery(filters));
  }
}

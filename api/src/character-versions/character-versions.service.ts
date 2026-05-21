import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCharacterVersionCommand } from './commands/impl/create-character-version.command';
import { CreateCharacterVersionsBulkCommand } from './commands/impl/create-character-versions-bulk.command';
import { UpdateCharacterVersionCommand } from './commands/impl/update-character-version.command';
import { DeleteCharacterVersionCommand } from './commands/impl/delete-character-version.command';
import { GetCharacterVersionsQuery } from './queries/impl/get-character-versions.query';
import { GetCharacterVersionQuery } from './queries/impl/get-character-version.query';
import { CreateCharacterVersionDto } from './dtos/create-character-version.dto';
import { UpdateCharacterVersionDto } from './dtos/update-character-version.dto';
import { CharacterVersionFilterDto } from './dtos/character-version-filter.dto';

@Injectable()
export class CharacterVersionsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(data: CreateCharacterVersionDto) {
    return this.commandBus.execute(new CreateCharacterVersionCommand(data));
  }

  createBulk(data: CreateCharacterVersionDto[]) {
    return this.commandBus.execute(new CreateCharacterVersionsBulkCommand(data));
  }

  findAll(filters: CharacterVersionFilterDto) {
    return this.queryBus.execute(new GetCharacterVersionsQuery(filters));
  }

  findOne(id: number) {
    return this.queryBus.execute(new GetCharacterVersionQuery(id));
  }

  update(id: number, data: UpdateCharacterVersionDto) {
    return this.commandBus.execute(new UpdateCharacterVersionCommand(id, data));
  }

  remove(id: number) {
    return this.commandBus.execute(new DeleteCharacterVersionCommand(id));
  }
}

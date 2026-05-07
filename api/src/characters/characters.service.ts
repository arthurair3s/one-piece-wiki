import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCharacterCommand } from './commands/impl/create-character.command';
import { CreateCharactersBulkCommand } from './commands/impl/create-characters-bulk.command';
import { GetCharactersQuery } from './queries/impl/get-characters.query';
import { GetCharacterQuery } from './queries/impl/get-character.query';
import { UpdateCharacterCommand } from './commands/impl/update-character.command';
import { DeleteCharacterCommand } from './commands/impl/delete-character.command';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { CharacterFilterDto } from './dtos/character-filter.dto';
import { UpdateCharacterDto } from './dtos/update-character.dto';

@Injectable()
export class CharactersService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(data: CreateCharacterDto) {
    return this.commandBus.execute(new CreateCharacterCommand(data));
  }

  createBulk(data: CreateCharacterDto[]) {
    return this.commandBus.execute(new CreateCharactersBulkCommand(data));
  }

  findAll(filters: CharacterFilterDto) {
    return this.queryBus.execute(new GetCharactersQuery(filters));
  }

  findOne(id: number) {
    return this.queryBus.execute(new GetCharacterQuery(id));
  }

  update(id: number, data: UpdateCharacterDto) {
    return this.commandBus.execute(new UpdateCharacterCommand(id, data));
  }

  remove(id: number) {
    return this.commandBus.execute(new DeleteCharacterCommand(id));
  }
}

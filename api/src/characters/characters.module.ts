import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { Character } from './models/character.model';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { CreateCharacterHandler } from './commands/handlers/create-character.handler';
import { CreateCharactersBulkHandler } from './commands/handlers/create-characters-bulk.handler';
import { UpdateCharacterHandler } from './commands/handlers/update-character.handler';
import { DeleteCharacterHandler } from './commands/handlers/delete-character.handler';
import { GetCharactersHandler } from './queries/handlers/get-characters.handler';
import { GetCharacterHandler } from './queries/handlers/get-character.handler';

@Module({
  imports: [CqrsModule, SequelizeModule.forFeature([Character])],
  controllers: [CharactersController],
  providers: [
    CharactersService,
    CreateCharacterHandler,
    CreateCharactersBulkHandler,
    UpdateCharacterHandler,
    DeleteCharacterHandler,
    GetCharactersHandler,
    GetCharacterHandler,
  ],
})
export class CharactersModule {}

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { CharacterVersion } from './models/character-version.model';
import { Character } from '../characters/models/character.model';
import { CharacterVersionsService } from './character-versions.service';
import { CharacterVersionsController } from './character-versions.controller';

import { CreateCharacterVersionHandler } from './commands/handlers/create-character-version.handler';
import { CreateCharacterVersionsBulkHandler } from './commands/handlers/create-character-versions-bulk.handler';
import { UpdateCharacterVersionHandler } from './commands/handlers/update-character-version.handler';
import { DeleteCharacterVersionHandler } from './commands/handlers/delete-character-version.handler';
import { GetCharacterVersionsHandler } from './queries/handlers/get-character-versions.handler';
import { GetCharacterVersionHandler } from './queries/handlers/get-character-version.handler';

@Module({
  imports: [CqrsModule, SequelizeModule.forFeature([CharacterVersion, Character])],
  controllers: [CharacterVersionsController],
  providers: [
    CharacterVersionsService,
    CreateCharacterVersionHandler,
    CreateCharacterVersionsBulkHandler,
    UpdateCharacterVersionHandler,
    DeleteCharacterVersionHandler,
    GetCharacterVersionsHandler,
    GetCharacterVersionHandler,
  ],
})
export class CharacterVersionsModule {}

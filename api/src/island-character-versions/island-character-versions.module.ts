import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { IslandCharacterVersion } from './models/island-character-version.model';
import { CharacterVersion } from '../character-versions/models/character-version.model';
import { Island } from '../islands/models/island.model';
import { IslandCharacterVersionsService } from './island-character-versions.service';
import { IslandCharacterVersionsController } from './island-character-versions.controller';

import { AddCharacterToIslandHandler } from './commands/handlers/add-character-to-island.handler';
import { RemoveCharacterFromIslandHandler } from './commands/handlers/remove-character-from-island.handler';
import { GetCharactersByIslandHandler } from './queries/handlers/get-characters-by-island.handler';

@Module({
  imports: [CqrsModule, SequelizeModule.forFeature([IslandCharacterVersion, CharacterVersion, Island])],
  controllers: [IslandCharacterVersionsController],
  providers: [
    IslandCharacterVersionsService,
    AddCharacterToIslandHandler,
    RemoveCharacterFromIslandHandler,
    GetCharactersByIslandHandler,
  ],
})
export class IslandCharacterVersionsModule {}

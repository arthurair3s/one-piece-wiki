import { AddCharacterToIslandDto } from '../../dtos/add-character-to-island.dto';

export class AddCharacterToIslandCommand {
  constructor(public readonly data: AddCharacterToIslandDto) {}
}

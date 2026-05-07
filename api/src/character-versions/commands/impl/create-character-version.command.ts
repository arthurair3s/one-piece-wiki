import { CreateCharacterVersionDto } from '../../dtos/create-character-version.dto';

export class CreateCharacterVersionCommand {
  constructor(public readonly data: CreateCharacterVersionDto) {}
}

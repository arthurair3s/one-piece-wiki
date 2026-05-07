import { CreateCharacterDto } from '../../dtos/create-character.dto';

export class CreateCharacterCommand {
  constructor(public readonly data: CreateCharacterDto) {}
}

import { CreateCharacterVersionDto } from '../../dtos/create-character-version.dto';

export class CreateCharacterVersionsBulkCommand {
  constructor(public readonly data: CreateCharacterVersionDto[]) {}
}

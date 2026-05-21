import { CreateCharacterDto } from '../../dtos/create-character.dto';

export class CreateCharactersBulkCommand {
  constructor(public readonly data: CreateCharacterDto[]) {}
}

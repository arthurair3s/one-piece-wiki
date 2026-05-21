import { CharacterFilterDto } from '../../dtos/character-filter.dto';

export class GetCharactersQuery {
  constructor(public readonly filters: CharacterFilterDto) {}
}

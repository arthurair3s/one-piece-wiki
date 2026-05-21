import { CharacterVersionFilterDto } from '../../dtos/character-version-filter.dto';

export class GetCharacterVersionsQuery {
  constructor(public readonly filters: CharacterVersionFilterDto) {}
}

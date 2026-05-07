import { IslandCharacterFilterDto } from '../../dtos/island-character-filter.dto';

export class GetCharactersByIslandQuery {
  constructor(public readonly filters: IslandCharacterFilterDto) {}
}

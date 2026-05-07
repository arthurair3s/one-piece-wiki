import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { GetCharactersByIslandQuery } from '../impl/get-characters-by-island.query';
import { IslandCharacterVersion } from '../../models/island-character-version.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';
import { Character } from '../../../characters/models/character.model';

@QueryHandler(GetCharactersByIslandQuery)
export class GetCharactersByIslandHandler implements IQueryHandler<GetCharactersByIslandQuery> {
  constructor(
    @InjectModel(IslandCharacterVersion)
    private readonly pivotModel: typeof IslandCharacterVersion,
  ) {}

  async execute(query: GetCharactersByIslandQuery) {
    const { page = 1, limit = 10, island_id, character_version_id, arc_id } = query.filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (island_id) where.island_id = island_id;
    if (character_version_id) where.character_version_id = character_version_id;

    const versionWhere: any = {};
    if (arc_id) versionWhere.arc_id = arc_id;

    return this.pivotModel.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      include: [
        {
          model: CharacterVersion,
          where: Object.keys(versionWhere).length > 0 ? versionWhere : undefined,
          include: [Character]
        }
      ]
    });
  }
}

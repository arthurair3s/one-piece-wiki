import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { GetCharacterVersionsQuery } from '../impl/get-character-versions.query';
import { CharacterVersion } from '../../models/character-version.model';
import { Character } from '../../../characters/models/character.model';
import { Arc } from '../../../arcs/models/arc.model';

@QueryHandler(GetCharacterVersionsQuery)
export class GetCharacterVersionsHandler implements IQueryHandler<GetCharacterVersionsQuery> {
  constructor(
    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,
  ) {}

  async execute(query: GetCharacterVersionsQuery) {
    const { page = 1, limit = 10, character_id, arc_id, status, alias, epithet } = query.filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (character_id) where.character_id = character_id;
    if (status) where.status = { [Op.iLike]: `%${status}%` };
    if (alias) where.alias = { [Op.iLike]: `%${alias}%` };
    if (epithet) where.epithet = { [Op.iLike]: `%${epithet}%` };

    const include: any[] = [Character];
    if (arc_id) {
      include.push({
        model: Arc,
        where: { id: arc_id },
        through: { attributes: [] }
      });
    }

    return this.characterVersionModel.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      include,
    });
  }
}

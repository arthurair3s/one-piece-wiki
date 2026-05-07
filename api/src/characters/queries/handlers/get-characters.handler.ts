import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { GetCharactersQuery } from '../impl/get-characters.query';
import { Character } from '../../models/character.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';
import { Arc } from '../../../arcs/models/arc.model';

@QueryHandler(GetCharactersQuery)
export class GetCharactersHandler implements IQueryHandler<GetCharactersQuery> {
  constructor(
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
  ) {}

  async execute(query: GetCharactersQuery) {
    const { page = 1, limit = 10, name, slug } = query.filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (slug) where.slug = { [Op.iLike]: `%${slug}%` };

    const { rows, count } = await this.characterModel.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      distinct: true, // Garante que a contagem seja de personagens únicos, não de linhas de JOIN
      subQuery: false, // Melhora a performance em tabelas com muitos relacionamentos
      include: [
        {
          model: CharacterVersion,
          include: [{ 
            model: Arc, 
            attributes: ['order'],
            through: { attributes: [] }
          }],
        },
      ],
    });

    // popula o current_status com o status da versão vinculada ao arco de maior order global
    rows.forEach((char: any) => {
      let latestArcOrder = -1;
      let latestStatus = 'UNKNOWN';

      char.versions?.forEach((version: any) => {
        version.arcs?.forEach((arc: any) => {
          if (arc.order > latestArcOrder) {
            latestArcOrder = arc.order;
            latestStatus = version.status;
          }
        });
      });

      char.setDataValue('current_status', latestStatus);
    });

    return { rows, count };
  }
}

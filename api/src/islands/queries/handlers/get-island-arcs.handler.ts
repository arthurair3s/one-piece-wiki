import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { Island } from '../../models/island.model';
import { Arc } from '../../../arcs/models/arc.model';
import { GetIslandArcsQuery } from '../impl/get-island-arcs.query';



@QueryHandler(GetIslandArcsQuery)
export class GetIslandArcsHandler
  implements IQueryHandler<GetIslandArcsQuery>
{
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(query: GetIslandArcsQuery) {
    const island = await this.islandModel.findByPk(query.islandId, {
      include: [
        {
          model: Arc,
          attributes: ['id', 'name'],
          through: { attributes: ['order'] },
        },
      ],
    });

    if (!island) {
      throw new NotFoundException('Ilha não encontrada');
    }

    const arcs = (island.arcs || [])
      .map((a: any) => ({
        id: a.id,
        name: a.name,
        order: a.arc_islands?.order ?? 0,
      }))
      .sort((a, b) => a.order - b.order);

    return {
      island: {
        id: island.id,
        name: island.name,
      },
      arcs,
    };
  }
}
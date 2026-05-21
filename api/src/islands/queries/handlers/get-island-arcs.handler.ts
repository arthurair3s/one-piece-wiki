import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { IslandRead } from '../../models/island-read.model';
import { ArcRead } from '../../../arcs/models/arc-read.model';
import { GetIslandArcsQuery } from '../impl/get-island-arcs.query';



@QueryHandler(GetIslandArcsQuery)
export class GetIslandArcsHandler
  implements IQueryHandler<GetIslandArcsQuery>
{
  constructor(
    @InjectModel(IslandRead, 'read-db')
    private readonly islandModel: typeof IslandRead,
  ) {}

  async execute(query: GetIslandArcsQuery) {
    const island = await this.islandModel.findByPk(query.islandId, {
      include: [
        {
          model: ArcRead,
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
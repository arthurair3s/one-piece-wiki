import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { GetIslandByIdQuery } from '../impl/get-island-by-id.query';
import { IslandRead } from '../../models/island-read.model';
import { ArcRead } from '../../../arcs/models/arc-read.model';

@QueryHandler(GetIslandByIdQuery)
export class GetIslandByIdHandler implements IQueryHandler<GetIslandByIdQuery> {
  constructor(
    @InjectModel(IslandRead, 'read-db')
    private readonly islandModel: typeof IslandRead,
  ) {}

  async execute(query: GetIslandByIdQuery): Promise<IslandRead> {
    const { id } = query;

    const island = await this.islandModel.findByPk(id, {
      include: [
        {
          model: ArcRead,
          attributes: ['id', 'name'],
          through: { attributes: ['order'] },
        },
      ],
    });

    if (!island) {
      throw new NotFoundException(`Ilha com ID ${id} não encontrada.`);
    }

    return island;
  }
}

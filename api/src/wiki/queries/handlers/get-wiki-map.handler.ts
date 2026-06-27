import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { GetWikiMapQuery } from '../impl/get-wiki-map.query';
import { IslandRead } from '../../../islands/models/island-read.model';

@QueryHandler(GetWikiMapQuery)
export class GetWikiMapHandler implements IQueryHandler<GetWikiMapQuery> {
  constructor(
    @InjectModel(IslandRead, 'read-db')
    private readonly islandReadModel: typeof IslandRead,
  ) {}

  async execute(_query: GetWikiMapQuery) {
    const islands = await this.islandReadModel.findAll({
      where: { is_active: true },
      attributes: [
        'id', 'name', 'thumbnail_url', 'model_url', 'coordinate_x', 'coordinate_y', 'coordinate_z',
        [
          Sequelize.literal(
            '(SELECT COUNT(*) FROM arc_islands WHERE arc_islands.island_id = "IslandRead".id AND arc_islands."deletedAt" IS NULL)',
          ),
          'arcCount',
        ],
      ],
    });

    return {
      islands: islands.map((i: any) => ({
        id: i.id,
        name: i.name,
        thumbnailUrl: i.thumbnail_url,
        model_url: i.model_url,
        coordinates: {
          x: i.coordinate_x,
          y: i.coordinate_y,
          z: i.coordinate_z,
        },
        arcCount: parseInt(i.getDataValue('arcCount'), 10) || 0,
      })),
      meta: { total: islands.length },
    };
  }
}

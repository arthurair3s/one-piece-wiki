import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { GetWikiMapFilteredQuery } from '../impl/get-wiki-map-filtered.query';
import { IslandRead } from '../../../islands/models/island-read.model';

@QueryHandler(GetWikiMapFilteredQuery)
export class GetWikiMapFilteredHandler implements IQueryHandler<GetWikiMapFilteredQuery> {
  constructor(
    @InjectModel(IslandRead, 'read-db')
    private readonly islandReadModel: typeof IslandRead,
  ) {}

  async execute(query: GetWikiMapFilteredQuery) {
    const { sagaId, arcId, search } = query;

    const where: any = { is_active: true };

    // Filtro por busca textual
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Filtro por arco (mais específico — prevalece sobre saga)
    if (arcId) {
      where.id = {
        ...(where.id || {}),
        [Op.in]: Sequelize.literal(
          `(SELECT island_id FROM arc_islands WHERE arc_id = ${Number(arcId)} AND "deletedAt" IS NULL)`,
        ),
      };
    } else if (sagaId) {
      // Filtro por saga (ilhas que participam de arcos desta saga)
      where.id = {
        ...(where.id || {}),
        [Op.in]: Sequelize.literal(
          `(SELECT ai.island_id FROM arc_islands ai ` +
          `JOIN arcs a ON a.id = ai.arc_id AND a."deletedAt" IS NULL ` +
          `WHERE a.saga_id = ${Number(sagaId)} AND ai."deletedAt" IS NULL)`,
        ),
      };
    }

    const islands = await this.islandReadModel.findAll({
      where,
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

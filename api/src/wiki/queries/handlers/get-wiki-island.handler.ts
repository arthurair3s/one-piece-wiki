import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { GetWikiIslandQuery } from '../impl/get-wiki-island.query';
import { IslandRead } from '../../../islands/models/island-read.model';
import { ArcIslandRead } from '../../../arcs/models/arc-island-read.model';
import { ArcRead } from '../../../arcs/models/arc-read.model';
import { SagaRead } from '../../../sagas/models/saga-read.model';

@QueryHandler(GetWikiIslandQuery)
export class GetWikiIslandHandler implements IQueryHandler<GetWikiIslandQuery> {
  constructor(
    @InjectModel(IslandRead, 'read-db')
    private readonly islandReadModel: typeof IslandRead,
    @InjectModel(ArcIslandRead, 'read-db')
    private readonly arcIslandReadModel: typeof ArcIslandRead,
  ) {}

  async execute(query: GetWikiIslandQuery) {
    const { islandId, sagaId, arcId } = query;

    // Query 1: dados da ilha
    const island = await this.islandReadModel.findByPk(islandId, {
      attributes: ['id', 'name', 'description', 'thumbnail_url',
        'coordinate_x', 'coordinate_y', 'coordinate_z'],
    });

    if (!island || island.is_active === false) {
      throw new NotFoundException('Ilha não encontrada');
    }

    // Query 2: arcos com filtro contextual
    const arcWhere: any = {};
    if (sagaId) arcWhere.saga_id = sagaId;
    if (arcId) arcWhere.id = arcId;

    const arcIslands = await this.arcIslandReadModel.findAll({
      where: { island_id: islandId },
      attributes: [
        'id',
        [
          Sequelize.literal(
            '(SELECT COUNT(*) FROM events WHERE events.arc_island_id = "ArcIslandRead".id AND events."deletedAt" IS NULL)',
          ),
          'eventsCount',
        ],
      ],
      include: [
        {
          model: ArcRead,
          where: Object.keys(arcWhere).length > 0 ? arcWhere : undefined,
          attributes: ['id', 'name', 'order'],
          include: [
            {
              model: SagaRead,
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    // Ordenar no JS para evitar problemas de alias do Sequelize
    arcIslands.sort((a: any, b: any) => {
      const orderA = a.arc?.order ?? 0;
      const orderB = b.arc?.order ?? 0;
      return orderA - orderB;
    });

    return {
      id: island.id,
      name: island.name,
      description: island.description,
      thumbnailUrl: island.thumbnail_url,
      coordinates: {
        x: island.coordinate_x,
        y: island.coordinate_y,
        z: island.coordinate_z,
      },
      arcs: arcIslands.map((ai: any) => ({
        id: ai.arc.id,
        name: ai.arc.name,
        sagaName: ai.arc.saga?.name,
        order: ai.arc.order,
        eventsCount: parseInt(ai.getDataValue('eventsCount'), 10) || 0,
      })),
    };
  }
}

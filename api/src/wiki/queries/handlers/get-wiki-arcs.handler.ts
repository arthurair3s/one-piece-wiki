import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { GetWikiArcsQuery } from '../impl/get-wiki-arcs.query';
import { ArcRead } from '../../../arcs/models/arc-read.model';
import { SagaRead } from '../../../sagas/models/saga-read.model';

@QueryHandler(GetWikiArcsQuery)
export class GetWikiArcsHandler implements IQueryHandler<GetWikiArcsQuery> {
  constructor(
    @InjectModel(ArcRead, 'read-db')
    private readonly arcReadModel: typeof ArcRead,
  ) {}

  async execute(query: GetWikiArcsQuery) {
    const where: any = {};
    if (query.sagaId) {
      where.saga_id = query.sagaId;
    }

    const arcs = await this.arcReadModel.findAll({
      where,
      attributes: [
        'id', 'name', 'order', 'saga_id',
        [
          Sequelize.literal(
            '(SELECT COUNT(*) FROM arc_islands WHERE arc_islands.arc_id = "ArcRead".id AND arc_islands."deletedAt" IS NULL)',
          ),
          'islandsCount',
        ],
      ],
      include: [
        {
          model: SagaRead,
          attributes: ['name'],
        },
      ],
      order: [['order', 'ASC']],
    });

    return {
      arcs: arcs.map((a: any) => ({
        id: a.id,
        name: a.name,
        order: a.order,
        sagaId: a.saga_id,
        sagaName: a.saga?.name,
        islandsCount: parseInt(a.getDataValue('islandsCount'), 10) || 0,
      })),
    };
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { GetEventsQuery } from '../impl/get-events.query';
import { EventRead } from '../../models/event-read.model';

@QueryHandler(GetEventsQuery)
export class GetEventsHandler implements IQueryHandler<GetEventsQuery> {
  constructor(
    @InjectModel(EventRead, 'read-db')
    private readonly eventReadModel: typeof EventRead,
  ) {}

  async execute(query: GetEventsQuery) {
    const { page = 1, limit = 10, island_id, type } = query;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (island_id) {
      where.island_id = island_id;
    }
    if (type) {
      where.type = type;
    }

    return this.eventReadModel.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      distinct: true,
      subQuery: false,
      order: [['order', 'ASC']],
    });
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { GetEventsQuery } from '../impl/get-events.query';
import { Event } from '../../models/event.model';

@QueryHandler(GetEventsQuery)
export class GetEventsHandler implements IQueryHandler<GetEventsQuery> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
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

    return this.eventModel.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      distinct: true,
      subQuery: false,
      order: [['order', 'ASC']],
    });
  }
}

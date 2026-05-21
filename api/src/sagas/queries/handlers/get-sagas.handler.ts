import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { GetSagasQuery } from '../impl/get-sagas.query';
import { SagaRead } from '../../models/saga-read.model';

@QueryHandler(GetSagasQuery)
export class GetSagasHandler implements IQueryHandler<GetSagasQuery> {
  constructor(
    @InjectModel(SagaRead, 'read-db')
    private readonly sagaModel: typeof SagaRead,
  ) {}

  async execute(query: GetSagasQuery) {
    const { page, limit, name, order } = query;

    const offset = (page - 1) * limit;

    const where: any = {};

    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }

    if (order !== undefined) {
      where.order = order;
    }

    const { rows, count } = await this.sagaModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['order', 'ASC']],
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        last_page: Math.ceil(count / limit),
      },
    };
  }
}
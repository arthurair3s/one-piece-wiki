import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { GetWikiSagasQuery } from '../impl/get-wiki-sagas.query';
import { SagaRead } from '../../../sagas/models/saga-read.model';

@QueryHandler(GetWikiSagasQuery)
export class GetWikiSagasHandler implements IQueryHandler<GetWikiSagasQuery> {
  constructor(
    @InjectModel(SagaRead, 'read-db')
    private readonly sagaReadModel: typeof SagaRead,
  ) {}

  async execute(_query: GetWikiSagasQuery) {
    const sagas = await this.sagaReadModel.findAll({
      attributes: ['id', 'name', 'order'],
      order: [['order', 'ASC']],
    });

    return {
      sagas: sagas.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
      })),
    };
  }
}

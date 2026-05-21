import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { GetSagaByIdQuery } from '../impl/get-saga-by-id.query';
import { SagaRead } from '../../models/saga-read.model';
import { ArcRead } from '../../../arcs/models/arc-read.model';

@QueryHandler(GetSagaByIdQuery)
export class GetSagaByIdHandler implements IQueryHandler<GetSagaByIdQuery> {
  constructor(
    @InjectModel(SagaRead, 'read-db')
    private readonly sagaModel: typeof SagaRead,
  ) {}

  async execute(query: GetSagaByIdQuery): Promise<SagaRead> {
    const { id } = query;

    const saga = await this.sagaModel.findByPk(id, {
      include: [
        {
          model: ArcRead,
          attributes: ['id', 'name', 'order', 'description'],
        },
      ],
      order: [[{ model: ArcRead, as: 'arcs' }, 'order', 'ASC']],
    });

    // validação: precisa existir
    if (!saga) {
      throw new NotFoundException('Saga não encontrada');
    }

    return saga;
  }
}
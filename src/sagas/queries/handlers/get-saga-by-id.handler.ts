import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { GetSagaByIdQuery } from '../impl/get-saga-by-id.query';
import { Saga } from 'src/sagas/models/saga.model';

@QueryHandler(GetSagaByIdQuery)
export class GetSagaByIdHandler implements IQueryHandler<GetSagaByIdQuery> {
  constructor(
    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,
  ) {}

  async execute(query: GetSagaByIdQuery): Promise<Saga> {
    const { id } = query;

    const saga = await this.sagaModel.findByPk(id);

    // REGRA — precisa existir
    if (!saga) {
      throw new NotFoundException('Saga não encontrada');
    }

    return saga;
  }
}
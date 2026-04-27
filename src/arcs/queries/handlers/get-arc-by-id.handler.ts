import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { GetArcByIdQuery } from '../impl/get-arc-by-id.query';
import { Arc } from 'src/arcs/models/arc.model';

@QueryHandler(GetArcByIdQuery)
export class GetArcByIdHandler implements IQueryHandler<GetArcByIdQuery> {
  constructor(
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,
  ) {}

  async execute(query: GetArcByIdQuery): Promise<Arc> {
    const { id } = query;

    const arc = await this.arcModel.findByPk(id);

    // REGRA — precisa existir
    if (!arc) {
      throw new NotFoundException('Arc não encontrado');
    }

    return arc;
  }
}
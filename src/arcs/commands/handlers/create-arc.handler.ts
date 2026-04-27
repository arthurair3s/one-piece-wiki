import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Op } from 'sequelize';

import { CreateArcCommand } from '../impl/create-arc.command';
import { Arc } from 'src/arcs/models/arc.model';
import { Saga } from 'src/sagas/models/saga.model';

@CommandHandler(CreateArcCommand)
export class CreateArcHandler implements ICommandHandler<CreateArcCommand> {
  constructor(
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,

    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,
  ) {}

  async execute(command: CreateArcCommand): Promise<Arc> {
    const { name, description, saga_id, order } = command;

    // REGRA 1 — validar saga
    const saga = await this.sagaModel.findByPk(saga_id);
    if (!saga) {
      throw new NotFoundException('Saga não encontrada');
    }

    // REGRA 2 e 3 — validar duplicidade (order ou name)
    const existing = await this.arcModel.findOne({
      where: {
        saga_id,
        [Op.or]: [{ order }, { name }],
      },
    });

    if (existing) {
      if (existing.order === order) {
        throw new BadRequestException(
          'Já existe um arco com essa ordem nessa saga',
        );
      }

      if (existing.name === name) {
        throw new BadRequestException(
          'Já existe um arco com esse nome nessa saga',
        );
      }
    }

    // criação
    const arc = await this.arcModel.create({
      name,
      description,
      saga_id,
      order,
    });

    return arc;
  }
}
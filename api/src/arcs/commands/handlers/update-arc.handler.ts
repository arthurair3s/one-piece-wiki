import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { UpdateArcCommand } from '../impl/update-arc.command';
import { Arc } from 'src/arcs/models/arc.model';
import { Saga } from 'src/sagas/models/saga.model';

@CommandHandler(UpdateArcCommand)
export class UpdateArcHandler implements ICommandHandler<UpdateArcCommand> {
  constructor(
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,

    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,
  ) {}

  async execute(command: UpdateArcCommand): Promise<Arc> {
    const { id, name, description, saga_id, order } = command;

    // REGRA 1 — Arc deve existir
    const arc = await this.arcModel.findByPk(id);
    if (!arc) {
      throw new NotFoundException('Arc não encontrado');
    }

    // REGRA 2 — Se for mudar saga, validar se ela existe
    let targetSagaId = arc.saga_id;

    if (saga_id !== undefined && saga_id !== arc.saga_id) {
      const saga = await this.sagaModel.findByPk(saga_id);
      if (!saga) {
        throw new NotFoundException('Saga não encontrada');
      }

      targetSagaId = saga_id;
    }

    // REGRA 3 — validar order dentro da saga alvo
    if (order !== undefined) {
      const existingOrder = await this.arcModel.findOne({
        where: {
          saga_id: targetSagaId,
          order,
        },
      });

      if (existingOrder && existingOrder.id !== id) {
        throw new BadRequestException(
          'Já existe um arco com essa ordem nessa saga',
        );
      }
    }

    // REGRA 4 — validar nome único dentro da saga
    if (name !== undefined) {
      const existingName = await this.arcModel.findOne({
        where: {
          saga_id: targetSagaId,
          name,
        },
      });

      if (existingName && existingName.id !== id) {
        throw new BadRequestException(
          'Já existe um arco com esse nome nessa saga',
        );
      }
    }

    // atualização
    await arc.update({
      name: name ?? arc.name,
      description: description ?? arc.description,
      saga_id: targetSagaId,
      order: order ?? arc.order,
    });

    return arc;
  }
}
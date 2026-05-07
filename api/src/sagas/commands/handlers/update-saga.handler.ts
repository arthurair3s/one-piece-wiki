import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { UpdateSagaCommand } from '../impl/update-saga.command';
import { Saga } from 'src/sagas/models/saga.model';

@CommandHandler(UpdateSagaCommand)
export class UpdateSagaHandler implements ICommandHandler<UpdateSagaCommand> {
  constructor(
    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,
  ) {}

  async execute(command: UpdateSagaCommand): Promise<Saga> {
    const { id, name, order } = command;

    // REGRA 1 — precisa existir
    const saga = await this.sagaModel.findByPk(id);
    if (!saga) {
      throw new NotFoundException('Saga não encontrada');
    }

    // REGRA 2 — validar order (ignorando a própria saga)
    if (order !== undefined) {
      const existingOrder = await this.sagaModel.findOne({
        where: { order },
      });

      if (existingOrder && existingOrder.id !== id) {
        throw new BadRequestException(
          'Já existe uma saga com essa ordem',
        );
      }
    }

    // REGRA 3 — validar nome único
    if (name !== undefined) {
      const existingName = await this.sagaModel.findOne({
        where: { name },
      });

      if (existingName && existingName.id !== id) {
        throw new BadRequestException(
          'Já existe uma saga com esse nome',
        );
      }
    }

    // atualização
    await saga.update({
      name: name ?? saga.name,
      order: order ?? saga.order,
    });

    return saga;
  }
}
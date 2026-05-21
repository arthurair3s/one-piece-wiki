import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { DeleteSagaCommand } from '../impl/delete-saga.command';
import { Saga } from 'src/sagas/models/saga.model';
import { Arc } from 'src/arcs/models/arc.model';

@CommandHandler(DeleteSagaCommand)
export class DeleteSagaHandler implements ICommandHandler<DeleteSagaCommand> {
  constructor(
    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,

    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,
  ) {}

  async execute(command: DeleteSagaCommand): Promise<void> {
    const { id } = command;

    // REGRA 1 — precisa existir
    const saga = await this.sagaModel.findByPk(id);
    if (!saga) {
      throw new NotFoundException('Saga não encontrada');
    }

    // REGRA 2 — não pode deletar se tiver arcs
    const hasArcs = await this.arcModel.findOne({
      where: { saga_id: id },
    });

    if (hasArcs) {
      throw new BadRequestException(
        'Não é possível deletar uma saga com arcos vinculados',
      );
    }

    // delete
    await saga.destroy();
  }
}
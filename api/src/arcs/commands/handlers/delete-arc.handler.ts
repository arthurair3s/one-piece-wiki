import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DeleteArcCommand } from '../impl/delete-arc.command';
import { Arc } from 'src/arcs/models/arc.model';
import { Island } from 'src/islands/models/island.model';

@CommandHandler(DeleteArcCommand)
export class DeleteArcHandler implements ICommandHandler<DeleteArcCommand> {
  constructor(
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,

    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(command: DeleteArcCommand): Promise<void> {
    const { id } = command;

    // REGRA 1 — Arc deve existir
    const arc = await this.arcModel.findByPk(id);
    if (!arc) {
      throw new NotFoundException('Arc não encontrado');
    }

    // REGRA 2 — Não pode deletar se tiver ilhas vinculadas
    const arcWithIslands = await this.arcModel.findByPk(id, {
      include: [{ model: Island, attributes: ['id'] }],
    });

    if (arcWithIslands?.islands && arcWithIslands.islands.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar um arco que possui ilhas vinculadas',
      );
    }

    // delete
    await arc.destroy();
  }
}
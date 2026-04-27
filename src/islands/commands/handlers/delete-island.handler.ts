import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { DeleteIslandCommand } from '../impl/delete-island.command';
import { Island } from '../../models/island.model';

@CommandHandler(DeleteIslandCommand)
export class DeleteIslandHandler
  implements ICommandHandler<DeleteIslandCommand>
{
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(command: DeleteIslandCommand): Promise<void> {
    const { id } = command;

    // REGRA 1 — island deve existir
    const island = await this.islandModel.findByPk(id);
    if (!island) {
      throw new NotFoundException('Island não encontrada');
    }

    // REGRA 2 — soft delete
    await island.update({
      is_active: false,
    });
  }
}
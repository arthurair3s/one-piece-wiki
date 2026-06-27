import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { DeleteIslandCommand } from '../impl/delete-island.command';
import { Island } from '../../models/island.model';
import { ArcIsland } from '../../../arcs/models/arc-island.model';
import { Sequelize } from 'sequelize-typescript';

@CommandHandler(DeleteIslandCommand)
export class DeleteIslandHandler
  implements ICommandHandler<DeleteIslandCommand>
{
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
    @InjectModel(ArcIsland)
    private readonly arcIslandModel: typeof ArcIsland,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: DeleteIslandCommand): Promise<void> {
    const { id } = command;

    // REGRA 1 — island deve existir
    const island = await this.islandModel.findByPk(id);
    if (!island) {
      throw new NotFoundException('Island não encontrada');
    }

    // REGRA 2 — soft delete técnico
    await this.sequelize.transaction(async (t) => {
      await this.arcIslandModel.destroy({
        where: { island_id: id },
        transaction: t,
      });

      await island.destroy({ transaction: t });
    });
  }
}
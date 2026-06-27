import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DeleteArcCommand } from '../impl/delete-arc.command';
import { Arc } from 'src/arcs/models/arc.model';
import { Island } from 'src/islands/models/island.model';
import { ArcCharacterVersion } from 'src/arcs/models/arc-character-version.model';
import { Sequelize } from 'sequelize-typescript';

@CommandHandler(DeleteArcCommand)
export class DeleteArcHandler implements ICommandHandler<DeleteArcCommand> {
  constructor(
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,

    @InjectModel(Island)
    private readonly islandModel: typeof Island,

    @InjectModel(ArcCharacterVersion)
    private readonly arcCharacterVersionModel: typeof ArcCharacterVersion,

    private readonly sequelize: Sequelize,
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

    // REGRA 3 — Limpar relações pivot (Cascata) antes de deletar o Arco
    await this.sequelize.transaction(async (t) => {
      await this.arcCharacterVersionModel.destroy({
        where: { arc_id: id },
        transaction: t,
      });

      await arc.destroy({ transaction: t });
    });
  }
}
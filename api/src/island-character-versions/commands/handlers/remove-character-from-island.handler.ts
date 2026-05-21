import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { RemoveCharacterFromIslandCommand } from '../impl/remove-character-from-island.command';
import { IslandCharacterVersion } from '../../models/island-character-version.model';

@CommandHandler(RemoveCharacterFromIslandCommand)
export class RemoveCharacterFromIslandHandler implements ICommandHandler<RemoveCharacterFromIslandCommand> {
  constructor(
    @InjectModel(IslandCharacterVersion)
    private readonly pivotModel: typeof IslandCharacterVersion,
  ) {}

  async execute(command: RemoveCharacterFromIslandCommand) {
    const { island_id, character_version_id } = command;

    const pivot = await this.pivotModel.findOne({
      where: { island_id, character_version_id }
    });

    if (!pivot) {
      throw new NotFoundException(`Vínculo entre a versão do personagem e a ilha não encontrado.`);
    }

    await pivot.destroy();
    return { success: true, message: `Vínculo removido com sucesso.` };
  }
}

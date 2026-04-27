import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AddCharacterToIslandCommand } from '../impl/add-character-to-island.command';
import { IslandCharacterVersion } from '../../models/island-character-version.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';

@CommandHandler(AddCharacterToIslandCommand)
export class AddCharacterToIslandHandler implements ICommandHandler<AddCharacterToIslandCommand> {
  constructor(
    @InjectModel(IslandCharacterVersion)
    private readonly pivotModel: typeof IslandCharacterVersion,
    @InjectModel(CharacterVersion)
    private readonly versionModel: typeof CharacterVersion,
  ) {}

  async execute(command: AddCharacterToIslandCommand) {
    const { character_version_id, island_id } = command.data;

    // Verifica se a versão do personagem existe
    const version = await this.versionModel.findByPk(character_version_id);
    if (!version) {
      throw new NotFoundException(`CharacterVersion com ID ${character_version_id} não encontrada.`);
    }

    // Verifica duplicação (não permitimos o mesmo personagem-versão na mesma ilha duas vezes)
    const exists = await this.pivotModel.findOne({
      where: { character_version_id, island_id }
    });

    if (exists) {
      throw new ConflictException(`A versão do personagem já está vinculada a esta ilha.`);
    }

    return this.pivotModel.create({ character_version_id, island_id });
  }
}

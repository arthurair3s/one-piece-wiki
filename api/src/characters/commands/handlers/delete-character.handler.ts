import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeleteCharacterCommand } from '../impl/delete-character.command';
import { Character } from '../../models/character.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';

@CommandHandler(DeleteCharacterCommand)
export class DeleteCharacterHandler implements ICommandHandler<DeleteCharacterCommand> {
  constructor(
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,
  ) { }

  async execute(command: DeleteCharacterCommand) {
    const character = await this.characterModel.findByPk(command.id);
    if (!character) {
      throw new NotFoundException(`Character com ID ${command.id} não encontrado`);
    }

    // Não pode deletar se tiver versões vinculadas
    const versions = await this.characterVersionModel.findOne({
      where: { character_id: command.id }
    });

    if (versions) {
      throw new BadRequestException(
        'Não é possível deletar um personagem que possui versões vinculadas',
      );
    }

    // 3. Delete the character itself
    await character.destroy();

    return { success: true, message: `Character com ID ${command.id} foi removido com sucesso` };
  }
}

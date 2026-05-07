import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { DeleteCharacterVersionCommand } from '../impl/delete-character-version.command';
import { CharacterVersion } from '../../models/character-version.model';

@CommandHandler(DeleteCharacterVersionCommand)
export class DeleteCharacterVersionHandler implements ICommandHandler<DeleteCharacterVersionCommand> {
  constructor(
    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,
  ) {}

  async execute(command: DeleteCharacterVersionCommand) {
    const version = await this.characterVersionModel.findByPk(command.id);
    if (!version) {
      throw new NotFoundException(`CharacterVersion com ID ${command.id} não encontrada`);
    }
    
    await version.destroy();
    return { success: true, message: `CharacterVersion com ID ${command.id} foi removida com sucesso` };
  }
}

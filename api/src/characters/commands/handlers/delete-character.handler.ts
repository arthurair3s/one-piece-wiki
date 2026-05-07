import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { DeleteCharacterCommand } from '../impl/delete-character.command';
import { Character } from '../../models/character.model';

@CommandHandler(DeleteCharacterCommand)
export class DeleteCharacterHandler implements ICommandHandler<DeleteCharacterCommand> {
  constructor(
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
  ) {}

  async execute(command: DeleteCharacterCommand) {
    const character = await this.characterModel.findByPk(command.id);
    if (!character) {
      throw new NotFoundException(`Character com ID ${command.id} não encontrado`);
    }
    await character.destroy();
    return { success: true, message: `Character com ID ${command.id} foi removido com sucesso` };
  }
}

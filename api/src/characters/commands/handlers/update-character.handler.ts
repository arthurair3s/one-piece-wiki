import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { UpdateCharacterCommand } from '../impl/update-character.command';
import { Character } from '../../models/character.model';

@CommandHandler(UpdateCharacterCommand)
export class UpdateCharacterHandler implements ICommandHandler<UpdateCharacterCommand> {
  constructor(
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
  ) {}

  async execute(command: UpdateCharacterCommand) {
    const character = await this.characterModel.findByPk(command.id);
    if (!character) {
      throw new NotFoundException(`Character com ID ${command.id} não encontrado`);
    }
    return character.update(command.data);
  }
}

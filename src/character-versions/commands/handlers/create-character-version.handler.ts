import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { CreateCharacterVersionCommand } from '../impl/create-character-version.command';
import { CharacterVersion } from '../../models/character-version.model';
import { Character } from '../../../characters/models/character.model';

@CommandHandler(CreateCharacterVersionCommand)
export class CreateCharacterVersionHandler implements ICommandHandler<CreateCharacterVersionCommand> {
  constructor(
    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
  ) {}

  async execute(command: CreateCharacterVersionCommand) {
    const character = await this.characterModel.findByPk(command.data.character_id);
    if (!character) {
      throw new NotFoundException(`Character com ID ${command.data.character_id} não encontrado`);
    }

    // O arc_id é testado aqui apenas como inteiro (soft link). Não checamos banco.
    return this.characterVersionModel.create(command.data as any);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { CreateCharacterCommand } from '../impl/create-character.command';
import { Character } from '../../models/character.model';

@CommandHandler(CreateCharacterCommand)
export class CreateCharacterHandler implements ICommandHandler<CreateCharacterCommand> {
  constructor(
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
  ) {}

  async execute(command: CreateCharacterCommand) {
    try {
      return await this.characterModel.create(command.data as any);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException(`Um personagem com o slug "${command.data.slug}" já existe.`);
      }
      throw error;
    }
  }
}

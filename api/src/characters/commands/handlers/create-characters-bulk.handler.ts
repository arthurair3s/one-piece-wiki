import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCharactersBulkCommand } from '../impl/create-characters-bulk.command';
import { Character } from '../../models/character.model';

@CommandHandler(CreateCharactersBulkCommand)
export class CreateCharactersBulkHandler implements ICommandHandler<CreateCharactersBulkCommand> {
  constructor(
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
  ) {}

  async execute(command: CreateCharactersBulkCommand) {
    return this.characterModel.bulkCreate(command.data as any[]);
  }
}

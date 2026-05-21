import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { CreateProfileCommand } from '../impl/create-profile.command';
import { Profile } from '../../models/profile.model';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
  constructor(
    @InjectModel(Profile)
    private readonly profileModel: typeof Profile,
  ) {}

  async execute(command: CreateProfileCommand) {
    return this.profileModel.create(command.data as any);
  }
}

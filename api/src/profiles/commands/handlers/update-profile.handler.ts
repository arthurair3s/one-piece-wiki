import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileCommand } from '../impl/update-profile.command';
import { Profile } from '../../models/profile.model';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(
    @InjectModel(Profile)
    private readonly profileModel: typeof Profile,
  ) {}

  async execute(command: UpdateProfileCommand) {
    const { id, data } = command;
    const profile = await this.profileModel.findByPk(id);

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    await profile.update(data);
    return profile;
  }
}

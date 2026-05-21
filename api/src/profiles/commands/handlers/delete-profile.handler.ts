import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { DeleteProfileCommand } from '../impl/delete-profile.command';
import { Profile } from '../../models/profile.model';

@CommandHandler(DeleteProfileCommand)
export class DeleteProfileHandler implements ICommandHandler<DeleteProfileCommand> {
  constructor(
    @InjectModel(Profile)
    private readonly profileModel: typeof Profile,
  ) {}

  async execute(command: DeleteProfileCommand) {
    const profile = await this.profileModel.findByPk(command.id);

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    await profile.destroy();
    return { success: true, message: 'Perfil removido com sucesso' };
  }
}

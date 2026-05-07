import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserCommand } from '../impl/delete-user.command';
import { User } from '../../models/user.model';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async execute(command: DeleteUserCommand) {
    const user = await this.userModel.findByPk(command.id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await user.destroy();
    return { success: true, message: 'Usuário removido com sucesso' };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserCommand } from '../impl/update-user.command';
import { User } from '../../models/user.model';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async execute(command: UpdateUserCommand) {
    const { id, data } = command;
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { password, ...rest } = data;
    const updatePayload: any = { ...rest };

    if (password) {
      updatePayload.password_hash = await bcrypt.hash(password, 10);
    }

    await user.update(updatePayload);
    return user;
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl/create-user.command';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../models/user.model';
import * as bcrypt from 'bcrypt';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) { }

  async execute(command: CreateUserCommand) {
    const { password, ...rest } = command.data;

    // hash de senha
    const hash = await bcrypt.hash(password, 10);

    return this.userModel.create({
      ...rest,
      password_hash: hash,
    });
  }
}

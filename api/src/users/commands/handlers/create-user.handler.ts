import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl/create-user.command';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../models/user.model';
import { ConflictException } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
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

    try {
      return await this.userModel.create({
        ...rest,
        password_hash: hash,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException(
          'Já existe um usuário com este username ou e-mail.',
        );
      }
      throw error;
    }
  }
}

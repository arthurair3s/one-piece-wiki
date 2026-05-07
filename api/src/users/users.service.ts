import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { GetUsersQuery } from './queries/impl/get-users.query';
import { UpdateUserCommand } from './commands/impl/update-user.command';
import { DeleteUserCommand } from './commands/impl/delete-user.command';
import { GetUserByIdQuery } from './queries/impl/get-user-by-id.query';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserFilterDto } from './dtos/user-filter.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(data: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(data));
  }

  findAll(filters: UserFilterDto) {
    return this.queryBus.execute(new GetUsersQuery(filters));
  }

  findOne(id: number) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  update(id: number, data: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, data));
  }

  remove(id: number) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}

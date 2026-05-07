import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePermissionCommand } from './commands/impl/create-permission.command';
import { UpdatePermissionCommand } from './commands/impl/update-permission.command';
import { DeletePermissionCommand } from './commands/impl/delete-permission.command';
import { GetPermissionsQuery } from './queries/impl/get-permissions.query';
import { GetPermissionByIdQuery } from './queries/impl/get-permission-by-id.query';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { PermissionFilterDto } from './dtos/filter-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(data: CreatePermissionDto) {
    return this.commandBus.execute(new CreatePermissionCommand(data));
  }
  findAll(filters: PermissionFilterDto) {
    return this.queryBus.execute(new GetPermissionsQuery(filters));
  }
  findOne(id: number) {
    return this.queryBus.execute(new GetPermissionByIdQuery(id));
  }
  update(id: number, data: UpdatePermissionDto) {
    return this.commandBus.execute(new UpdatePermissionCommand(id, data));
  }
  remove(id: number) {
    return this.commandBus.execute(new DeletePermissionCommand(id));
  }
}

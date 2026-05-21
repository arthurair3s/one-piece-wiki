import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from '../../models/permission.model';
import { CreatePermissionCommand } from '../impl/create-permission.command';

@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler implements ICommandHandler<CreatePermissionCommand> {
  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
  ) {}

  async execute(command: CreatePermissionCommand) {
    return this.permissionModel.create(command.data as Partial<Permission>);
  }
}

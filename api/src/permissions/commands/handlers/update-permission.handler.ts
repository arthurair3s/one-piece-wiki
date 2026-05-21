import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePermissionCommand } from '../impl/update-permission.command';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from '@/permissions/models/permission.model';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler implements ICommandHandler<UpdatePermissionCommand> {
  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
  ) {}

  async execute(command: UpdatePermissionCommand) {
    const { id, data } = command;
    const permission = await this.permissionModel.findByPk(id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    await permission.update(data);
    return permission;
  }
}

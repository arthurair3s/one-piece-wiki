import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { DeletePermissionCommand } from '../impl/delete-permission.command';
import { Permission } from '@/permissions/models/permission.model';

@CommandHandler(DeletePermissionCommand)
export class DeletePermissionHandler implements ICommandHandler<DeletePermissionCommand> {
  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
  ) { }

  async execute(command: DeletePermissionCommand) {
    const permission = await this.permissionModel.findByPk(command.id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    await permission.destroy();

    return { success: true, message: 'Permissão removida com sucesso' };
  }
}

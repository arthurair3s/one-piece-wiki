import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfilePermissionsCommand } from '../impl/update-profile-permissions.command';
import { Profile } from '../../models/profile.model';
import { ProfilePermission } from '../../../permissions/models/profile-permission.model';

@CommandHandler(UpdateProfilePermissionsCommand)
export class UpdateProfilePermissionsHandler implements ICommandHandler<UpdateProfilePermissionsCommand> {
  constructor(
    private readonly sequelize: Sequelize,
    @InjectModel(Profile)
    private readonly profileModel: typeof Profile,
    @InjectModel(ProfilePermission)
    private readonly profilePermissionModel: typeof ProfilePermission,
  ) { }

  async execute(command: UpdateProfilePermissionsCommand) {
    const { profileId, data } = command;
    const { permissionIds } = data;

    const profile = await this.profileModel.findByPk(profileId);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    if (profile.name === 'ADMIN' || profileId === 1) {
      const { BadRequestException } = require('@nestjs/common');
      throw new BadRequestException('As permissões do perfil ADMIN (mestre) não podem ser alteradas');
    }

    return await this.sequelize.transaction(async (transaction) => {
      await this.profilePermissionModel.destroy({
        where: { profile_id: profileId },
        transaction,
      });

      if (permissionIds && permissionIds.length > 0) {
        const records = permissionIds.map((permId) => ({
          profile_id: profileId,
          permission_id: permId,
        }));

        await this.profilePermissionModel.bulkCreate(records, { transaction });
      }

      return {
        success: true,
        message: 'Permissões do perfil atualizadas com sucesso',
        count: permissionIds.length,
      };
    });
  }
}

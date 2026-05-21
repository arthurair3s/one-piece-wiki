import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { GetProfilePermissionsQuery } from '../impl/get-profile-permissions.query';
import { Profile } from '../../models/profile.model';
import { Permission } from '../../../permissions/models/permission.model';

@QueryHandler(GetProfilePermissionsQuery)
export class GetProfilePermissionsHandler implements IQueryHandler<GetProfilePermissionsQuery> {
  constructor(
    @InjectModel(Profile)
    private readonly profileModel: typeof Profile,
  ) {}

  async execute(query: GetProfilePermissionsQuery) {
    const { id } = query;

    const profile = await this.profileModel.findByPk(id, {
      include: [
        {
          model: Permission,
          through: { attributes: [] }, // oculta pivot
        },
      ],
    });

    if (!profile) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado.`);
    }

    return profile.permissions;
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPermissionByIdQuery } from '../impl/get-permission-by-id.query';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from '@/permissions/models/permission.model';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetPermissionByIdQuery)
export class GetPermissionByIdHandler implements IQueryHandler<GetPermissionByIdQuery> {
  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
  ) {}

  async execute(query: GetPermissionByIdQuery) {
    const permission = await this.permissionModel.findByPk(query.id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    return permission;
  }
}

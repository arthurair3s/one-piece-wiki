import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPermissionsQuery } from '../impl/get-permissions.query';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from '@/permissions/models/permission.model';
import { Op } from 'sequelize';

@QueryHandler(GetPermissionsQuery)
export class GetPermissionsHandler implements IQueryHandler<GetPermissionsQuery> {
  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
  ) {}

  async execute(query: GetPermissionsQuery) {
    const { page = 1, limit = 10, name, slug } = query.filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (slug) where.slug = { [Op.iLike]: `%${slug}%` };

    return this.permissionModel.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
    });
  }
}

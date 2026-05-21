import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../impl/get-users.query';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../models/user.model';
import { Op } from 'sequelize';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async execute(query: GetUsersQuery) {
    const { page = 1, limit = 10, username, email } = query.filters;
    const offset = (page - 1) * limit;

    //filtros dinamicos
    const where: any = {};
    if (username) where.username = { [Op.iLike]: `%${username}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };

    return this.userModel.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      include: ['profile'], //traz a role/cargo junto
    });
  }
}

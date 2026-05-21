import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { GetProfilesQuery } from '../impl/get-profiles.query';
import { Profile } from '../../models/profile.model';

@QueryHandler(GetProfilesQuery)
export class GetProfilesHandler implements IQueryHandler<GetProfilesQuery> {
  constructor(
    @InjectModel(Profile)
    private readonly profileModel: typeof Profile,
  ) {}

  async execute(query: GetProfilesQuery) {
    const { page = 1, limit = 10, name } = query.filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };

    return this.profileModel.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
    });
  }
}

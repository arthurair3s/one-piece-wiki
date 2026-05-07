import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { GetProfileByIdQuery } from '../impl/get-profile-by-id.query';
import { Profile } from '../../models/profile.model';

@QueryHandler(GetProfileByIdQuery)
export class GetProfileByIdHandler implements IQueryHandler<GetProfileByIdQuery> {
  constructor(
    @InjectModel(Profile)
    private readonly profileModel: typeof Profile,
  ) {}

  async execute(query: GetProfileByIdQuery) {
    const profile = await this.profileModel.findByPk(query.id);

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return profile;
  }
}

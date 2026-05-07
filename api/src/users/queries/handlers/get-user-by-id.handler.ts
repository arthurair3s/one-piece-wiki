import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdQuery } from '../impl/get-user-by-id.query';
import { User } from '../../models/user.model';
import { Profile } from '../../../profiles/models/profile.model';
import { Permission } from '../../../permissions/models/permission.model';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async execute(query: GetUserByIdQuery) {
    const user = await this.userModel.findByPk(query.id, {
      include: [
        {
          model: Profile,
          include: [Permission],
        },
      ],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }
}

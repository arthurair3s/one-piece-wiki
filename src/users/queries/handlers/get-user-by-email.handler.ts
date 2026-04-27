import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { GetUserByEmailQuery } from '../impl/get-user-by-email.query';
import { User } from '../../models/user.model';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) { }

  async execute(query: GetUserByEmailQuery) {
    return this.userModel.findOne({
      where: { email: query.email },
      include: { all: true } // carrega o perfil ao login ser efetuado
    });
  }
}

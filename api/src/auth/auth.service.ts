import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { GetUserByEmailQuery } from '../users/queries/impl/get-user-by-email.query';
import { CreateUserCommand } from '../users/commands/impl/create-user.command';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const DEFAULT_PROFILE_ID = 2; // perfil USER
    return this.commandBus.execute(
      new CreateUserCommand({ ...data, profile_id: DEFAULT_PROFILE_ID }),
    );
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email));
    
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user.get({ plain: true });
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.profile?.name,
      },
    };
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { GetUserByEmailQuery } from '../users/queries/impl/get-user-by-email.query';

@Injectable()
export class AuthService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

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

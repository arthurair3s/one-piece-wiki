import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QueryBus } from '@nestjs/cqrs';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { GetUserByIdQuery } from '../../users/queries/impl/get-user-by-id.query';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private queryBus: QueryBus,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.IGNORE_PERMISSIONS === 'true') {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    const fullUser = await this.queryBus.execute(new GetUserByIdQuery(user.id));

    const userPermissions = fullUser.profile?.permissions?.map((p: any) => p.slug) || [];

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Acesso negado: você não possui as permissões necessárias.');
    }

    return true;
  }
}

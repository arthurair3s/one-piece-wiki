import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from './models/permission.model';
import { ProfilePermission } from './models/profile-permission.model';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { CreatePermissionHandler } from './commands/handlers/create-permission.handler';
import { UpdatePermissionHandler } from './commands/handlers/update-permission.handler';
import { DeletePermissionHandler } from './commands/handlers/delete-permission.handler';
import { GetPermissionsHandler } from './queries/handlers/get-permissions.handler';
import { GetPermissionByIdHandler } from './queries/handlers/get-permission-by-id.handler';

@Module({
  imports: [CqrsModule, SequelizeModule.forFeature([Permission, ProfilePermission])],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    CreatePermissionHandler,
    UpdatePermissionHandler,
    DeletePermissionHandler,
    GetPermissionsHandler,
    GetPermissionByIdHandler,
  ],
  exports: [SequelizeModule],
})
export class PermissionsModule { }

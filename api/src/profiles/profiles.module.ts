import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from './models/profile.model';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { CreateProfileHandler } from './commands/handlers/create-profile.handler';
import { GetProfilesHandler } from './queries/handlers/get-profiles.handler';
import { UpdateProfileHandler } from './commands/handlers/update-profile.handler';
import { DeleteProfileHandler } from './commands/handlers/delete-profile.handler';
import { GetProfileByIdHandler } from './queries/handlers/get-profile-by-id.handler';
import { UpdateProfilePermissionsHandler } from './commands/handlers/update-profile-permissions.handler';
import { GetProfilePermissionsHandler } from './queries/handlers/get-profile-permissions.handler';
import { ProfilePermission } from '@/permissions/models/profile-permission.model';

@Module({
  imports: [CqrsModule, SequelizeModule.forFeature([Profile, ProfilePermission])],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    CreateProfileHandler,
    GetProfilesHandler,
    UpdateProfileHandler,
    DeleteProfileHandler,
    GetProfileByIdHandler,
    UpdateProfilePermissionsHandler,
    GetProfilePermissionsHandler,
  ],
  exports: [SequelizeModule],
})
export class ProfilesModule {}

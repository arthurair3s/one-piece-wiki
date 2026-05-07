import { UpdateProfilePermissionsDto } from "../../dtos/update-profile-permissions.dto";

export class UpdateProfilePermissionsCommand {
  constructor(
    public readonly profileId: number,
    public readonly data: UpdateProfilePermissionsDto
  ) { }
}

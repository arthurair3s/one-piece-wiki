import { UpdatePermissionDto } from "../../dtos/update-permission.dto";

export class UpdatePermissionCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdatePermissionDto
  ) { }
}
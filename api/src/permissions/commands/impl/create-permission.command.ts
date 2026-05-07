import { CreatePermissionDto } from "../../dtos/create-permission.dto";

export class CreatePermissionCommand {
  constructor(public readonly data: CreatePermissionDto) { }
}
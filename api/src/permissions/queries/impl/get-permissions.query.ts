import { PermissionFilterDto } from '@/permissions/dtos/filter-permission.dto';

export class GetPermissionsQuery {
  constructor(public readonly filters: PermissionFilterDto) {}
}

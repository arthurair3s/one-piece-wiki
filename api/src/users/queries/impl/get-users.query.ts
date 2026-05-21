import { UserFilterDto } from '../../dtos/user-filter.dto';

export class GetUsersQuery {
  constructor(public readonly filters: UserFilterDto) {}
}

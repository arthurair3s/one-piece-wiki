import { ProfileFilterDto } from '../../dtos/profile-filter.dto';

export class GetProfilesQuery {
  constructor(public readonly filters: ProfileFilterDto) {}
}

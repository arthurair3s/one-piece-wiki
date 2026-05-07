import { UpdateProfileDto } from '../../dtos/update-profile.dto';

export class UpdateProfileCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateProfileDto,
  ) {}
}

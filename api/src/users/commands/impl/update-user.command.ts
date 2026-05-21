import { UpdateUserDto } from '../../dtos/update-user.dto';

export class UpdateUserCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateUserDto,
  ) { }
}

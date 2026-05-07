import { CreateProfileDto } from '../../dtos/create-profile.dto';

export class CreateProfileCommand {
  constructor(public readonly data: CreateProfileDto) {}
}

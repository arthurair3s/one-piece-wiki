import { UpdateCharacterVersionDto } from '../../dtos/update-character-version.dto';

export class UpdateCharacterVersionCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateCharacterVersionDto,
  ) {}
}

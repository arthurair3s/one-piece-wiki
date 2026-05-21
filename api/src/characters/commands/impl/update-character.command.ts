import { UpdateCharacterDto } from '../../dtos/update-character.dto';

export class UpdateCharacterCommand {
  constructor(
    public readonly id: number,
    public readonly data: UpdateCharacterDto,
  ) {}
}

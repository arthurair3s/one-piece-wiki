import { PartialType } from '@nestjs/swagger';
import { CreateCharacterVersionDto } from './create-character-version.dto';

export class UpdateCharacterVersionDto extends PartialType(CreateCharacterVersionDto) {}

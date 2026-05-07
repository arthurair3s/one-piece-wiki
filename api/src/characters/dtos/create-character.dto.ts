import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCharacterDto {
  @ApiProperty({ example: 'Monkey D. Luffy', description: 'Nome do personagem' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'monkey-d-luffy', description: 'URL amigável única' })
  @IsString()
  @IsNotEmpty()
  slug!: string;
}

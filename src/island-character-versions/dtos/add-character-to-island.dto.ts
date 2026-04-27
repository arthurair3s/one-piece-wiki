import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddCharacterToIslandDto {
  @ApiProperty({ example: 1, description: 'ID da versão do personagem' })
  @IsInt()
  @IsNotEmpty()
  character_version_id!: number;

  @ApiProperty({ example: 1, description: 'ID da Ilha (Soft Link)' })
  @IsInt()
  @IsNotEmpty()
  island_id!: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class AddCharacterToIslandDto {
  @ApiProperty({ example: 1, description: 'ID da versão do personagem' })
  @IsInt()
  @IsNotEmpty()
  character_version_id!: number;

  @ApiProperty({ example: 1, description: 'ID da Ilha (Soft Link)' })
  @IsInt()
  @IsNotEmpty()
  island_id!: number;

  @ApiProperty({ example: 0, description: 'ordem de exibição na ilha', required: false })
  @IsInt()
  @IsOptional()
  order?: number;
}

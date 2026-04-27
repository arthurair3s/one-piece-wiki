import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, IsUrl } from 'class-validator';

export class CreateCharacterVersionDto {
  @ApiProperty({ example: 1, description: 'ID do personagem base' })
  @IsInt()
  @IsNotEmpty()
  character_id!: number;

  @ApiProperty({ example: 1, description: 'ID do arco (Soft Link)' })
  @IsInt()
  @IsNotEmpty()
  arc_id!: number;

  @ApiPropertyOptional({ example: 'Sogeking', description: 'Nome utilizado no contexto' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional({ example: 'O Rei dos Atiradores', description: 'Título utilizado no contexto' })
  @IsOptional()
  @IsString()
  epithet?: string;

  @ApiPropertyOptional({ example: 30000000, description: 'Recompensa do personagem neste arco' })
  @IsOptional()
  @IsNumber()
  bounty?: number;

  @ApiPropertyOptional({ example: 'Pirata novato', description: 'Status na época do arco' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'http://image.url/luffy.png', description: 'URL da imagem' })
  @IsOptional()
  @IsString()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({ example: 'Sua primeira aparição', description: 'Descrição da versão' })
  @IsOptional()
  @IsString()
  description?: string;
}

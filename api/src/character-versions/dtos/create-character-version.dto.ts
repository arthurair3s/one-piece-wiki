import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, IsUrl, IsEnum } from 'class-validator';
import { CharacterStatus } from '../../common/enums/character-status.enum';

export class CreateCharacterVersionDto {
  @ApiProperty({ example: 1, description: 'ID do personagem base' })
  @IsInt()
  @IsNotEmpty()
  character_id!: number;

  @ApiProperty({ example: [1, 2], description: 'IDs dos arcos onde esta versão é válida', isArray: true })
  @IsInt({ each: true })
  @IsNotEmpty()
  arc_ids!: number[];

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

  @ApiPropertyOptional({ 
    description: 'Status de vida do personagem no contexto do arco',
    enum: CharacterStatus,
    default: CharacterStatus.ALIVE,
  })
  @IsOptional()
  @IsEnum(CharacterStatus)
  status?: CharacterStatus;

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

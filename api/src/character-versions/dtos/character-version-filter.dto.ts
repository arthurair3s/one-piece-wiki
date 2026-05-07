import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CharacterVersionFilterDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtro por ID do Personagem' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  character_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filtro por ID do Arco' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  arc_id?: number;

  @ApiPropertyOptional({ example: 'Sogeking', description: 'Filtro por alias' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional({ example: 'Atirador', description: 'Filtro por epithet' })
  @IsOptional()
  @IsString()
  epithet?: string;

  @ApiPropertyOptional({ example: 'Vivo', description: 'Filtro por status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Página atual' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Itens por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

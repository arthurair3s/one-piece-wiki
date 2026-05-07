import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IslandCharacterFilterDto {
  @ApiPropertyOptional({ example: 1, description: 'ID da Ilha' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  island_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID da Versão do Personagem' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  character_version_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filtrar personagens de um arco específico nesta ilha' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  arc_id?: number;

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

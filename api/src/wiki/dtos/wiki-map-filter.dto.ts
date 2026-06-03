import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class WikiMapFilterDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtro por saga (retorna ilhas de arcos desta saga)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sagaId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Filtro por arco (retorna ilhas deste arco)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  arcId?: number;

  @ApiPropertyOptional({ example: 'Dawn', description: 'Busca por nome da ilha' })
  @IsOptional()
  @IsString()
  search?: string;
}

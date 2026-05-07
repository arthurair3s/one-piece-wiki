import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterIslandDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtro por ID do arco' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  arc_id?: number;

  @ApiPropertyOptional({ description: 'Filtro por status de atividade' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ default: 1, description: 'Página para paginação' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Limite de itens por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EventFilterDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtro por ID da ilha' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  island_id?: number;

  @ApiPropertyOptional({ example: 'Batalha', description: 'Filtro por tipo de evento' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ default: 1, description: 'Página para paginação' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Limite de itens por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;
}

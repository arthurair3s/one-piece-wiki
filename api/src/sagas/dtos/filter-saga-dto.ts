import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterSagaDto {
  @ApiPropertyOptional({ example: 'Alabasta', description: 'Filtro parcial por nome da saga' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filtro por ordem cronológica' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
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
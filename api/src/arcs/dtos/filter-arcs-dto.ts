import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterArcDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtro por ID da saga' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  saga_id?: number;

  @ApiPropertyOptional({ example: 'Alabasta', description: 'Filtro parcial por nome do arco' })
  @IsOptional()
  @IsString()
  name?: string;

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
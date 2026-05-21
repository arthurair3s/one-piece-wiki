import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionFilterDto {
  @ApiPropertyOptional({
    example: 'Gerenciar',
    description: 'Filtro parcial pelo nome da permissão',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'users',
    description: 'Filtro parcial pelo slug da permissão',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 1, description: 'Página atual', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Itens por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

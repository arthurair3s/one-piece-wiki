import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CharacterFilterDto {
  @ApiPropertyOptional({ example: 'Luffy', description: 'Filtro por nome' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'monkey-d-luffy', description: 'Filtro por slug' })
  @IsOptional()
  @IsString()
  slug?: string;

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

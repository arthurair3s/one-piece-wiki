import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UserFilterDto {
  @ApiPropertyOptional({
    example: 'nome',
    description: 'Filtra por nome de usuário (busca parcial)',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'email@email.com',
    description: 'Filtra por e-mail (busca parcial)',
  })
  @IsOptional()
  @IsString()
  email?: string;

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

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ProfileFilterDto {
  @ApiPropertyOptional({ example: 'ADMIN', description: 'Filtra por cargo/role (busca parcial)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Concede ao usuario acesso ao sistema com base no cargo/role',
    description: 'Descrição de cargos',
  })
  @IsOptional()
  @IsString()
  description?: string;

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

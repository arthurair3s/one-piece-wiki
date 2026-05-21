import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'ADMIN',
    description: 'Nome do cargo/role',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Concede ao usuario acesso ao sistema com base no cargo/role',
    description: 'Descrição de cargos',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

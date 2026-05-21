import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    example: 'ADMIN',
    description: 'Nome do cargo/role',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Concede ao usuario acesso ao sistema com base no cargo/role',
    description: 'Descrição de cargos',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

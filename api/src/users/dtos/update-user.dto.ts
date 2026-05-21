import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'nome', description: 'Nome de usuário único' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'email@email.com', description: 'E-mail único' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'senha123', description: 'Senha (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID do perfil/role do usuário' })
  @IsOptional()
  profile_id?: number;
}

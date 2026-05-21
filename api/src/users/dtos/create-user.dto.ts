import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'nome', description: 'Nome de usuário único' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'email@email.com', description: 'E-mail único' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 1, description: 'ID do perfil/role do usuário' })
  @IsNotEmpty()
  profile_id: number;
}

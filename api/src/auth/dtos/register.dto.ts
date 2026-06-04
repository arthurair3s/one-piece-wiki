import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'mugiwara', description: 'Nome de usuário único' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'luffy@grandline.com', description: 'E-mail único' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha1234', description: 'Senha (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  password: string;
}

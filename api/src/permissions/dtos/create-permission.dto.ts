import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Gerenciar Usuários',
    description: 'Nome amigável da permissão',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'users.manage',
    description: 'Identificador único (slug) usado nos Guards de segurança',
  })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    example: 'Permite criar, editar e excluir usuários do sistema',
    description: 'Descrição detalhada da finalidade da permissão',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    example: 'Gerenciar Usuários',
    description: 'Nome amigável da permissão',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'users.manage',
    description: 'Identificador único (slug) usado nos Guards de segurança',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Permite criar, editar e excluir usuários do sistema',
    description: 'Descrição detalhada da finalidade da permissão',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

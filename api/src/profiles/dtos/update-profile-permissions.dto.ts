import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class UpdateProfilePermissionsDto {
  @ApiProperty({
    example: [1, 2, 5],
    description: 'Array de IDs das permissões que o perfil deve possuir',
  })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}

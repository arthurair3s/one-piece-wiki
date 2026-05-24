import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class WikiIslandContextDto {
  @ApiPropertyOptional({ example: 1, description: 'Contexto de saga ativo no HUD' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sagaId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Contexto de arco ativo no HUD' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  arcId?: number;
}

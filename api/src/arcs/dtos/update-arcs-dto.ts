import { IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArcDto {
  @ApiPropertyOptional({ example: 'Enies Lobby', description: 'Nome do arco' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'O arco de resgate da Robin e confronto com a CP9.', description: 'Descrição detalhada do arco' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID da saga à qual o arco pertence' })
  @IsOptional()
  @IsInt()
  saga_id?: number;

  @ApiPropertyOptional({ example: 2, description: 'Ordem cronológica do arco dentro da saga' })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}
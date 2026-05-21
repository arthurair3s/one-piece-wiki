import { IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSagaDto {
  @ApiPropertyOptional({ example: 'Saga de Water 7', description: 'Nome da saga' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 2, description: 'Ordem cronológica da saga no sistema' })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}
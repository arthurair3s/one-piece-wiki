import { IsString, IsNotEmpty, MaxLength, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSagaDto {
  @ApiProperty({ example: 'Saga de Alabasta', description: 'Nome da saga' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'A primeira grande saga na Grand Line.', description: 'Descrição enciclopédica da saga' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, description: 'Ordem cronológica da saga no sistema' })
  @IsInt()
  @Min(1)
  order!: number;
}
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArcDto {
  @ApiProperty({ example: 'Alabasta', description: 'Nome do arco' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'O arco em que os Chapéus de Palha ajudam Vivi a salvar seu reino de Crocodile.', description: 'Descrição detalhada do arco' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 1, description: 'ID da saga à qual o arco pertence' })
  @IsInt()
  @Min(1)
  saga_id!: number;

  @ApiProperty({ example: 1, description: 'Ordem cronológica do arco dentro da saga' })
  @IsInt()
  @Min(1)
  order!: number;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        island_id: { type: 'number' },
        order: { type: 'number' },
      },
    },
    description: 'Lista de ilhas associadas com ordem',
  })
  @IsOptional()
  @IsArray()
  islands?: { island_id: number; order: number }[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        character_version_id: { type: 'number' },
        order: { type: 'number' },
      },
    },
    description: 'Lista de versões de personagens associadas com ordem',
  })
  @IsOptional()
  @IsArray()
  character_versions?: { character_version_id: number; order: number }[];
}
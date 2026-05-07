import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
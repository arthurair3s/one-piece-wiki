import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIslandDto {
  @ApiProperty({ example: 'Dawn Island', description: 'Nome da ilha' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'A ilha onde Luffy nasceu e cresceu.', description: 'Descrição detalhada da ilha' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: [1], description: 'IDs dos arcos em que esta ilha aparece', type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  arc_ids!: number[];

  @ApiProperty({ example: 100.5, description: 'Coordenada X no mapa 3D' })
  @Type(() => Number)
  @IsNumber()
  coordinate_x!: number;

  @ApiProperty({ example: 200.0, description: 'Coordenada Y no mapa 3D' })
  @Type(() => Number)
  @IsNumber()
  coordinate_y!: number;

  @ApiProperty({ example: 50.2, description: 'Coordenada Z no mapa 3D' })
  @Type(() => Number)
  @IsNumber()
  coordinate_z!: number;

  @ApiProperty({ example: 'https://models.onepiece.com/islands/dawn.glb', description: 'URL do modelo 3D da ilha' })
  @IsString()
  @IsNotEmpty()
  model_url!: string;

  @ApiPropertyOptional({ example: 'https://images.onepiece.com/islands/dawn.jpg', description: 'URL da miniatura/imagem da ilha' })
  @IsOptional()
  @IsUrl()
  thumbnail_url?: string;

  @ApiPropertyOptional({ default: true, description: 'Define se a ilha está ativa no sistema' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 1, description: 'ID da ilha onde o evento ocorreu' })
  @IsInt()
  @IsNotEmpty()
  island_id!: number;

  @ApiProperty({ example: 1, description: 'ID do arco onde o evento ocorre. OBRIGATÓRIO e deve estar associado à ilha' })
  @IsInt()
  @IsNotEmpty()
  arc_id!: number;

  @ApiProperty({ example: 'Destruição de Ohara', description: 'Título do evento' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ required: false, example: 'O incidente da Buster Call que resultou na destruição total da ilha de Ohara e de seus estudiosos.', description: 'Descrição detalhada do evento' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Buster Call', description: 'Tipo ou categoria do evento' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ default: 0, example: 1, description: 'Ordem cronológica do evento na ilha' })
  @IsInt()
  @IsOptional()
  order?: number;
}

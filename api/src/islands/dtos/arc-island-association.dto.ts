import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ArcIslandAssociationDto {
  @ApiProperty({ example: 1, description: 'ID do arco' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  arc_id!: number;

  @ApiProperty({ example: 1, description: 'Ordem da ilha neste arco' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  order!: number;
}

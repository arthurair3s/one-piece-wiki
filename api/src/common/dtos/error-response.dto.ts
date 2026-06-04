import { ApiProperty } from '@nestjs/swagger';
import { IErrorResponse } from '../interfaces/error-response.interface';

/**
 * DTO de resposta de erro padronizado para documentação Swagger.
 * Implementa IErrorResponse para garantir consistência com o contrato
 * retornado pelo AllExceptionsFilter.
 */
export class ErrorResponseDto implements IErrorResponse {
  @ApiProperty({ description: 'Código HTTP do erro', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Mensagem descritiva do erro', example: 'Erro de validação nos dados enviados.' })
  message: string;

  @ApiProperty({ description: 'Tipo do erro HTTP', example: 'Bad Request' })
  error: string;

  @ApiProperty({ description: 'Data/hora do erro em formato ISO 8601', example: '2026-06-03T20:42:05.123Z' })
  timestamp: string;

  @ApiProperty({ description: 'Path da requisição que gerou o erro', example: '/api/characters' })
  path: string;
}

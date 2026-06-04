/**
 * Contrato compartilhado para respostas de erro da API.
 * Reflete fielmente o payload retornado pelo AllExceptionsFilter.
 * Implementado pelo ErrorResponseDto para garantir tipagem forte
 * sem acoplamento direto ao Swagger nos consumidores.
 */
export interface IErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

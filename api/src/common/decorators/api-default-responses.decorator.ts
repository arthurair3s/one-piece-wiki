import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dtos/error-response.dto';

/**
 * Decorator composto que documenta as respostas de erro padrão
 * para endpoints protegidos por autenticação e RBAC.
 *
 * Encapsula:
 * - 400 Bad Request (validação / parâmetros inválidos)
 * - 401 Unauthorized (token ausente ou inválido)
 * - 403 Forbidden (falta de permissão)
 *
 * Uso: aplicar no nível da classe do controller.
 *
 * @example
 * ```ts
 * @ApiDefaultResponses()
 * export class CharactersController { }
 * ```
 *
 * Respostas específicas como 409 Conflict devem ser adicionadas
 * individualmente nos endpoints que implementam regras de conflito.
 */
export function ApiDefaultResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Requisição inválida (Erro de validação ou parâmetros).',
      schema: {
        allOf: [{ $ref: '#/components/schemas/ErrorResponseDto' }],
        example: {
          statusCode: 400,
          message: 'Erro de validação nos dados enviados.',
          error: 'Bad Request',
          timestamp: '2026-06-03T20:42:05.123Z',
          path: '/api/example-path',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Não autorizado (Token ausente ou inválido).',
      schema: {
        allOf: [{ $ref: '#/components/schemas/ErrorResponseDto' }],
        example: {
          statusCode: 401,
          message: 'Token ausente ou inválido.',
          error: 'Unauthorized',
          timestamp: '2026-06-03T20:42:05.123Z',
          path: '/api/example-path',
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Proibido (Falta de permissão).',
      schema: {
        allOf: [{ $ref: '#/components/schemas/ErrorResponseDto' }],
        example: {
          statusCode: 403,
          message: 'Sem permissão para acessar este recurso.',
          error: 'Forbidden',
          timestamp: '2026-06-03T20:42:05.123Z',
          path: '/api/example-path',
        },
      },
    }),
  );
}

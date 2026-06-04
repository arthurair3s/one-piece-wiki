import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody , getSchemaPath, ApiExtraModels} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

import { SagasService } from './sagas.service';
import { CreateSagaDto } from './dtos/create-saga-dto';
import { UpdateSagaDto } from './dtos/update-saga-dto';
import { FilterSagaDto } from './dtos/filter-saga-dto';
import { ApiDefaultResponses } from '../common/decorators/api-default-responses.decorator';
import { ErrorResponseDto } from '../common/dtos/error-response.dto';

@ApiBearerAuth('access-token')
@ApiTags('Sagas')
@Controller('sagas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiDefaultResponses()
@ApiExtraModels(ErrorResponseDto)
export class SagasController {
  constructor(private readonly sagasService: SagasService) {}

  @ApiOperation({ summary: 'Criar uma nova saga' })
  @ApiResponse({ status: 201, description: 'Saga criada com sucesso.' })
  @ApiResponse({
    status: 409,
    description: 'Já existe uma saga com este nome ou ordem.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 409,
        message: 'Já existe uma saga com este nome ou ordem.',
        error: 'Conflict',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('sagas.create')
  @Post()
  create(@Body() dto: CreateSagaDto) {
    return this.sagasService.create(dto);
  }

  @ApiOperation({ summary: 'Criar múltiplas sagas em lote' })
  @ApiBody({ type: [CreateSagaDto] })
  @ApiResponse({ status: 201, description: 'Sagas criadas com sucesso.' })
  @ApiResponse({
    status: 409,
    description: 'Conflito de nome ou ordem em um dos registros.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 409,
        message: 'Conflito de nome ou ordem em um dos registros.',
        error: 'Conflict',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('sagas.create')
  @Post('bulk')
  createBulk(@Body() dtos: CreateSagaDto[]) {
    return this.sagasService.createBulk(dtos);
  }

  @ApiOperation({ summary: 'Listar sagas com paginação' })
  @ApiResponse({ status: 200, description: 'Lista de sagas retornada com sucesso.' })
  @RequirePermissions('sagas.view')
  @Get()
  findAll(@Query() query: FilterSagaDto) {
    return this.sagasService.findAll(query);
  }

  @ApiOperation({ summary: 'Buscar uma saga específica pelo ID' })
  @ApiResponse({ status: 200, description: 'Saga encontrada.' })
  @ApiResponse({
    status: 404,
    description: 'Saga não encontrada.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Saga não encontrada.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('sagas.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sagasService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar os dados de uma saga existente' })
  @ApiResponse({ status: 200, description: 'Saga atualizada com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Saga não encontrada.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Saga não encontrada.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('sagas.update')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSagaDto,
  ) {
    return this.sagasService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remover uma saga do sistema' })
  @ApiResponse({ status: 200, description: 'Saga removida com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Não é possível deletar uma saga com arcos vinculados.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 400,
        message: 'Não é possível deletar uma saga com arcos vinculados.',
        error: 'Bad Request',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Saga não encontrada.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Saga não encontrada.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('sagas.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sagasService.remove(id);
  }
}
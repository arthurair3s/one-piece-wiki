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

import { ArcsService } from './arcs.service';
import { CreateArcDto } from './dtos/create-arcs-dto';
import { UpdateArcDto } from './dtos/update-arcs-dto';
import { FilterArcDto } from './dtos/filter-arcs-dto';
import { ApiDefaultResponses } from '../common/decorators/api-default-responses.decorator';
import { ErrorResponseDto } from '../common/dtos/error-response.dto';

@ApiBearerAuth('access-token')
@ApiTags('Arcs')
@Controller('arcs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiDefaultResponses()
@ApiExtraModels(ErrorResponseDto)
export class ArcsController {
  constructor(private readonly arcsService: ArcsService) {}

  @ApiOperation({ summary: 'Criar um novo arco' })
  @ApiResponse({ status: 201, description: 'Arco criado com sucesso.' })
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
  @ApiResponse({
    status: 409,
    description: 'Arco já existe nesta saga.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 409,
        message: 'Arco já existe nesta saga.',
        error: 'Conflict',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('arcs.create')
  @Post()
  create(@Body() dto: CreateArcDto) {
    return this.arcsService.create(dto);
  }

  @ApiOperation({ summary: 'Criar múltiplos arcos em lote' })
  @ApiBody({ type: [CreateArcDto] })
  @ApiResponse({ status: 201, description: 'Arcos criados com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Sagas não encontradas.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Sagas não encontradas.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
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
  @RequirePermissions('arcs.create')
  @Post('bulk')
  createBulk(@Body() dtos: CreateArcDto[]) {
    return this.arcsService.createBulk(dtos);
  }

  @ApiOperation({ summary: 'Listar arcos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de arcos retornada com sucesso.' })
  @RequirePermissions('arcs.view')
  @Get()
  findAll(@Query() query: FilterArcDto) {
    return this.arcsService.findAll(query);
  }

  @ApiOperation({ summary: 'Buscar um arco específico pelo ID' })
  @ApiResponse({ status: 200, description: 'Arco encontrado.' })
  @ApiResponse({
    status: 404,
    description: 'Arco não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Arco não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('arcs.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.arcsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar os dados de um arco existente' })
  @ApiResponse({ status: 200, description: 'Arco atualizado com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Arco não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Arco não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('arcs.update')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArcDto,
  ) {
    return this.arcsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remover um arco do sistema' })
  @ApiResponse({ status: 200, description: 'Arco removido com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Arco não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Arco não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('arcs.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.arcsService.remove(id);
  }
}
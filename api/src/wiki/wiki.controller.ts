import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery , getSchemaPath, ApiExtraModels} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

import { WikiMapFilterDto } from './dtos/wiki-map-filter.dto';
import { WikiIslandContextDto } from './dtos/wiki-island-context.dto';

import { GetWikiSagasQuery } from './queries/impl/get-wiki-sagas.query';
import { GetWikiArcsQuery } from './queries/impl/get-wiki-arcs.query';
import { GetWikiMapQuery } from './queries/impl/get-wiki-map.query';
import { GetWikiMapFilteredQuery } from './queries/impl/get-wiki-map-filtered.query';
import { GetWikiIslandQuery } from './queries/impl/get-wiki-island.query';
import { GetWikiIslandArcQuery } from './queries/impl/get-wiki-island-arc.query';
import { ApiDefaultResponses } from '../common/decorators/api-default-responses.decorator';
import { ErrorResponseDto } from '../common/dtos/error-response.dto';

@ApiBearerAuth('access-token')
@ApiTags('Wiki')
@Controller('wiki')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiDefaultResponses()
@ApiExtraModels(ErrorResponseDto)
export class WikiController {
  constructor(private readonly queryBus: QueryBus) {}

  // ─── Endpoint 1: Dropdown de sagas ───
  @ApiOperation({ summary: 'Listar sagas para o dropdown do HUD' })
  @ApiResponse({ status: 200, description: 'Lista de sagas retornada.' })
  @RequirePermissions('wiki.read')
  @Get('sagas')
  getSagas() {
    return this.queryBus.execute(new GetWikiSagasQuery());
  }

  // ─── Endpoint 2: Scroll horizontal de arcos ───
  @ApiOperation({ summary: 'Listar arcos para o scroll horizontal do HUD' })
  @ApiQuery({ name: 'sagaId', required: false, type: Number, description: 'Filtro por saga' })
  @ApiResponse({ status: 200, description: 'Lista de arcos retornada.' })
  @RequirePermissions('wiki.read')
  @Get('arcs')
  getArcs(@Query('sagaId') sagaId?: number) {
    return this.queryBus.execute(
      new GetWikiArcsQuery(sagaId ? Number(sagaId) : undefined),
    );
  }

  // ─── Endpoint 3: Mapa — first login ───
  @ApiOperation({ summary: 'Carregar mapa 3D completo (first login)', description: 'Retorna todas as ilhas ativas com coordenadas para renderização no Three.js.' })
  @ApiResponse({ status: 200, description: 'Mapa retornado.' })
  @RequirePermissions('wiki.read')
  @Get('map')
  getMap() {
    return this.queryBus.execute(new GetWikiMapQuery());
  }

  // ─── Endpoint 4: Mapa — filtrado pelo HUD ───
  @ApiOperation({ summary: 'Carregar mapa 3D filtrado', description: 'Atualiza o mapa conforme os filtros ativos do HUD (saga, arco, busca).' })
  @ApiResponse({ status: 200, description: 'Mapa filtrado retornado.' })
  @RequirePermissions('wiki.read')
  @Get('map/filter')
  getMapFiltered(@Query() filters: WikiMapFilterDto) {
    return this.queryBus.execute(
      new GetWikiMapFilteredQuery(filters.sagaId, filters.arcId, filters.search),
    );
  }

  // ─── Endpoint 5: Painel lateral da ilha (contextual) ───
  @ApiOperation({ summary: 'Obter detalhes de uma ilha', description: 'Retorna descrição e arcos da ilha, filtrados pelo contexto ativo do HUD.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da ilha' })
  @ApiQuery({ name: 'sagaId', required: false, type: Number, description: 'Contexto de saga ativo' })
  @ApiQuery({ name: 'arcId', required: false, type: Number, description: 'Contexto de arco ativo' })
  @ApiResponse({ status: 200, description: 'Detalhes da ilha retornados.' })
  @ApiResponse({
    status: 404,
    description: 'Ilha não encontrada.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Ilha não encontrada.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('wiki.read')
  @Get('islands/:id')
  getIsland(
    @Param('id', ParseIntPipe) id: number,
    @Query() context: WikiIslandContextDto,
  ) {
    return this.queryBus.execute(
      new GetWikiIslandQuery(id, context.sagaId, context.arcId),
    );
  }

  // ─── Endpoint 6: Conteúdo — personagens + eventos ───
  @ApiOperation({ summary: 'Obter personagens e eventos de um arco em uma ilha', description: 'Retorna personagens do arco e eventos que ocorreram nesta ilha durante este arco.' })
  @ApiParam({ name: 'islandId', type: Number, description: 'ID da ilha' })
  @ApiParam({ name: 'arcId', type: Number, description: 'ID do arco' })
  @ApiResponse({ status: 200, description: 'Conteúdo retornado.' })
  @ApiResponse({
    status: 400,
    description: 'Arco não vinculado à ilha.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 400,
        message: 'Arco não vinculado à ilha.',
        error: 'Bad Request',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('wiki.read')
  @Get('islands/:islandId/arcs/:arcId')
  getIslandArc(
    @Param('islandId', ParseIntPipe) islandId: number,
    @Param('arcId', ParseIntPipe) arcId: number,
  ) {
    return this.queryBus.execute(
      new GetWikiIslandArcQuery(islandId, arcId),
    );
  }
}

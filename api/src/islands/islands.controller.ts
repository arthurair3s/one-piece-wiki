import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

import { IslandsService } from './islands.service';

import { CreateIslandDto } from './dtos/create-island.dto';
import { UpdateIslandDto } from './dtos/update-island.dto';
import { FilterIslandDto } from './dtos/filter-island.dto';

@ApiBearerAuth('access-token')
@ApiTags('Islands')
@Controller('islands')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiResponse({ status: 400, description: 'Requisição inválida.' })
@ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
@ApiResponse({ status: 403, description: 'Proibido (Falta de permissão).' })
export class IslandsController {
  constructor(private readonly islandsService: IslandsService) {}
  
  @ApiOperation({ summary: 'Listar ilhas com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de ilhas retornada com sucesso.' })
  @RequirePermissions('islands.view')
  @Get()
  findAll(@Query() query: FilterIslandDto) {
    return this.islandsService.findAll(query);
  }
  @ApiOperation({ summary: 'Criar uma nova ilha no mapa' })
  @ApiResponse({ status: 201, description: 'Ilha criada com sucesso.' })
  @RequirePermissions('islands.create')
  @Post()
  create(@Body() dto: CreateIslandDto) {
    return this.islandsService.create(dto);
  }
  
  @ApiOperation({ summary: 'Obter mapa completo das ilhas', description: 'Retorna uma lista otimizada com coordenadas 3D para renderização.' })
  @ApiResponse({ status: 200, description: 'Mapa de ilhas retornado com sucesso.' })
  @RequirePermissions('islands.view')
  @Get('map')
  getMap() {
    return this.islandsService.getMap();
  }

  @ApiOperation({ summary: 'Obter arcos de uma ilha específica', description: 'Lista todos os arcos temporais vinculados a esta ilha.' })
  @ApiParam({ name: 'id', description: 'ID numérico da ilha', type: 'integer' })
  @ApiResponse({ status: 200, description: 'Arcos da ilha retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Ilha não encontrada.' })
  @RequirePermissions('islands.view')
  @Get(':id/arcs')
  getArcs(@Param('id', ParseIntPipe) id: number) {
    return this.islandsService.getArcs(id);
  }
  
  @ApiOperation({ summary: 'Obter detalhes cronológicos de uma ilha', description: 'Retorna a ilha filtrada por um arco, garantindo precisão temporal dos personagens.' })
  @ApiParam({ name: 'id', description: 'ID numérico da ilha', type: 'integer' })
  @ApiQuery({ name: 'arc_id', description: 'Filtro obrigatório do arco temporal', type: 'integer', required: true })
  @ApiResponse({ status: 200, description: 'Detalhes da ilha retornados com sucesso.' })
  @ApiResponse({ status: 400, description: 'O parâmetro arc_id é obrigatório.' })
  @ApiResponse({ status: 404, description: 'Ilha não encontrada.' })
  @RequirePermissions('islands.view')
  @Get(':id/details')
  findDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('arc_id') arcId: number,
  ) {
    if (!arcId) {
      throw new BadRequestException('arc_id é obrigatório');
    }

    return this.islandsService.findDetails(id, Number(arcId));
  }
  @ApiOperation({ summary: 'Criar múltiplas ilhas em lote' })
  @ApiBody({ type: [CreateIslandDto] })
  @ApiResponse({ status: 201, description: 'Ilhas criadas com sucesso.' })
  @RequirePermissions('islands.create')
  @Post('bulk')
  createBulk(@Body() dtos: CreateIslandDto[]) {
    return this.islandsService.createBulk(dtos);
  }

  @ApiOperation({ summary: 'Atualizar os dados de uma ilha existente' })
  @ApiResponse({ status: 200, description: 'Ilha atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Ilha não encontrada.' })
  @RequirePermissions('islands.update')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIslandDto,
  ) {
    return this.islandsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remover uma ilha do mapa (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Ilha removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Ilha não encontrada.' })
  @RequirePermissions('islands.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.islandsService.remove(id);
  }
}
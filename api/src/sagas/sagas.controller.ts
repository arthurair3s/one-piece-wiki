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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

import { SagasService } from './sagas.service';
import { CreateSagaDto } from './dtos/create-saga-dto';
import { UpdateSagaDto } from './dtos/update-saga-dto';
import { FilterSagaDto } from './dtos/filter-saga-dto';

@ApiBearerAuth('access-token')
@ApiTags('Sagas')
@Controller('sagas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiResponse({ status: 400, description: 'Requisição inválida.' })
@ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
@ApiResponse({ status: 403, description: 'Proibido (Falta de permissão).' })
export class SagasController {
  constructor(private readonly sagasService: SagasService) {}

  @ApiOperation({ summary: 'Criar uma nova saga' })
  @ApiResponse({ status: 201, description: 'Saga criada com sucesso.' })
  @RequirePermissions('sagas.create')
  @Post()
  create(@Body() dto: CreateSagaDto) {
    return this.sagasService.create(dto);
  }

  @ApiOperation({ summary: 'Criar múltiplas sagas em lote' })
  @ApiBody({ type: [CreateSagaDto] })
  @ApiResponse({ status: 201, description: 'Sagas criadas com sucesso.' })
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
  @ApiResponse({ status: 404, description: 'Saga não encontrada.' })
  @RequirePermissions('sagas.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sagasService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar os dados de uma saga existente' })
  @ApiResponse({ status: 200, description: 'Saga atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Saga não encontrada.' })
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
  @ApiResponse({ status: 404, description: 'Saga não encontrada.' })
  @RequirePermissions('sagas.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sagasService.remove(id);
  }
}
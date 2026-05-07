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

import { ArcsService } from './arcs.service';
import { CreateArcDto } from './dtos/create-arcs-dto';
import { UpdateArcDto } from './dtos/update-arcs-dto';
import { FilterArcDto } from './dtos/filter-arcs-dto';

@ApiBearerAuth('access-token')
@ApiTags('Arcs')
@Controller('arcs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiResponse({ status: 400, description: 'Requisição inválida.' })
@ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
@ApiResponse({ status: 403, description: 'Proibido (Falta de permissão).' })
export class ArcsController {
  constructor(private readonly arcsService: ArcsService) {}

  @ApiOperation({ summary: 'Criar um novo arco' })
  @ApiResponse({ status: 201, description: 'Arco criado com sucesso.' })
  @RequirePermissions('arcs.create')
  @Post()
  create(@Body() dto: CreateArcDto) {
    return this.arcsService.create(dto);
  }

  @ApiOperation({ summary: 'Criar múltiplos arcos em lote' })
  @ApiBody({ type: [CreateArcDto] })
  @ApiResponse({ status: 201, description: 'Arcos criados com sucesso.' })
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
  @ApiResponse({ status: 404, description: 'Arco não encontrado.' })
  @RequirePermissions('arcs.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.arcsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar os dados de um arco existente' })
  @ApiResponse({ status: 200, description: 'Arco atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Arco não encontrado.' })
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
  @ApiResponse({ status: 404, description: 'Arco não encontrado.' })
  @RequirePermissions('arcs.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.arcsService.remove(id);
  }
}
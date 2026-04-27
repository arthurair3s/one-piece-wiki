import { Controller, Post, Get, Body, Query, Param, Patch, Delete, ParseIntPipe, ParseArrayPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CharacterVersionsService } from './character-versions.service';
import { CreateCharacterVersionDto } from './dtos/create-character-version.dto';
import { UpdateCharacterVersionDto } from './dtos/update-character-version.dto';
import { CharacterVersionFilterDto } from './dtos/character-version-filter.dto';

@ApiBearerAuth('access-token')
@ApiTags('CharacterVersions')
@Controller('character-versions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiResponse({ status: 400, description: 'Requisição inválida.' })
@ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
@ApiResponse({ status: 403, description: 'Proibido (Falta de permissão).' })
export class CharacterVersionsController {
  constructor(private readonly characterVersionsService: CharacterVersionsService) {}

  @ApiOperation({ summary: 'Criar uma nova versão de personagem' })
  @ApiResponse({ status: 201, description: 'Versão de personagem criada com sucesso.' })
  @RequirePermissions('versions.create')
  @Post()
  create(@Body() body: CreateCharacterVersionDto) {
    return this.characterVersionsService.create(body);
  }

  @ApiOperation({ summary: 'Criar múltiplas versões de personagens em lote (Bulk)' })
  @ApiBody({ type: [CreateCharacterVersionDto] })
  @ApiResponse({ status: 201, description: 'Versões de personagens criadas em lote com sucesso.' })
  @RequirePermissions('versions.create')
  @Post('bulk')
  createBulk(@Body(new ParseArrayPipe({ items: CreateCharacterVersionDto })) bodies: CreateCharacterVersionDto[]) {
    return this.characterVersionsService.createBulk(bodies);
  }

  @ApiOperation({ summary: 'Listar versões de personagens com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de versões retornada com sucesso.' })
  @RequirePermissions('versions.view')
  @Get()
  findAll(@Query() params: CharacterVersionFilterDto) {
    return this.characterVersionsService.findAll(params);
  }

  @ApiOperation({ summary: 'Buscar versão de personagem pelo ID' })
  @ApiResponse({ status: 200, description: 'Versão de personagem encontrada.' })
  @ApiResponse({ status: 404, description: 'Versão de personagem não encontrada.' })
  @RequirePermissions('versions.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.characterVersionsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar uma versão de personagem' })
  @ApiResponse({ status: 200, description: 'Versão de personagem atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Versão de personagem não encontrada.' })
  @RequirePermissions('versions.update')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCharacterVersionDto) {
    return this.characterVersionsService.update(id, body);
  }

  @ApiOperation({ summary: 'Remover uma versão de personagem (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Versão de personagem removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Versão de personagem não encontrada.' })
  @RequirePermissions('versions.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.characterVersionsService.remove(id);
  }
}

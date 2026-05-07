import { Controller, Post, Get, Body, Query, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { IslandCharacterVersionsService } from './island-character-versions.service';
import { AddCharacterToIslandDto } from './dtos/add-character-to-island.dto';
import { IslandCharacterFilterDto } from './dtos/island-character-filter.dto';

@ApiBearerAuth('access-token')
@ApiTags('IslandCharacterVersions')
@Controller('island-character-versions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiResponse({ status: 400, description: 'Requisição inválida.' })
@ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
@ApiResponse({ status: 403, description: 'Proibido (Falta de permissão).' })
export class IslandCharacterVersionsController {
  constructor(private readonly islandCharacterVersionsService: IslandCharacterVersionsService) {}

  @ApiOperation({ summary: 'Vincular uma versão de personagem a uma Ilha' })
  @ApiResponse({ status: 201, description: 'Vínculo criado com sucesso.' })
  @RequirePermissions('island_char.create')
  @Post()
  addCharacterToIsland(@Body() body: AddCharacterToIslandDto) {
    return this.islandCharacterVersionsService.addCharacterToIsland(body);
  }

  @ApiOperation({ summary: 'Listar vínculos de personagens com ilhas' })
  @ApiResponse({ status: 200, description: 'Lista de vínculos retornada com sucesso.' })
  @RequirePermissions('island_char.view')
  @Get()
  getCharactersByIsland(@Query() params: IslandCharacterFilterDto) {
    return this.islandCharacterVersionsService.getCharactersByIsland(params);
  }

  @ApiOperation({ summary: 'Remover o vínculo de um personagem com uma Ilha' })
  @ApiResponse({ status: 200, description: 'Vínculo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado.' })
  @RequirePermissions('island_char.delete')
  @Delete(':island_id/:character_version_id')
  removeCharacterFromIsland(
    @Param('island_id', ParseIntPipe) island_id: number,
    @Param('character_version_id', ParseIntPipe) character_version_id: number
  ) {
    return this.islandCharacterVersionsService.removeCharacterFromIsland(island_id, character_version_id);
  }
}

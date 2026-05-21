import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { PermissionFilterDto } from './dtos/filter-permission.dto';

@ApiBearerAuth('access-token')
@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiResponse({ status: 400, description: 'Requisição inválida.' })
@ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
@ApiResponse({ status: 403, description: 'Proibido (Falta de permissão).' })
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @ApiOperation({ summary: 'Criar uma nova permissão no sistema' })
  @ApiResponse({ status: 201, description: 'Permissão criada com sucesso.' })
  @RequirePermissions('permissions.create')
  @Post()
  create(@Body() data: CreatePermissionDto) { 
    return this.permissionsService.create(data); 
  }

  @ApiOperation({ summary: 'Listar todas as permissões com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de permissões retornada com sucesso.' })
  @RequirePermissions('permissions.view')
  @Get()
  findAll(@Query() filters: PermissionFilterDto) { 
    return this.permissionsService.findAll(filters); 
  }

  @ApiOperation({ summary: 'Buscar dados de uma permissão específica pelo ID' })
  @ApiResponse({ status: 200, description: 'Permissão encontrada.' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada.' })
  @RequirePermissions('permissions.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { 
    return this.permissionsService.findOne(id); 
  }

  @ApiOperation({ summary: 'Atualizar os dados de uma permissão existente' })
  @ApiResponse({ status: 200, description: 'Permissão atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada.' })
  @RequirePermissions('permissions.update')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdatePermissionDto) { 
    return this.permissionsService.update(id, data); 
  }

  @ApiOperation({ summary: 'Remover permanentemente uma permissão do sistema' })
  @ApiResponse({ status: 200, description: 'Permissão removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada.' })
  @RequirePermissions('permissions.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { 
    return this.permissionsService.remove(id); 
  }
}

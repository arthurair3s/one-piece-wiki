import { Controller, Post, Get, Body, Query, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { ProfileFilterDto } from './dtos/profile-filter.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateProfilePermissionsDto } from './dtos/update-profile-permissions.dto';

@ApiBearerAuth('access-token')
@ApiTags('Profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiResponse({ status: 400, description: 'Requisição inválida.' })
@ApiResponse({ status: 401, description: 'Não autorizado (Token ausente ou inválido).' })
@ApiResponse({ status: 403, description: 'Proibido (Falta de permissão).' })
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @ApiOperation({ summary: 'Criar um novo perfil no sistema' })
  @ApiResponse({ status: 201, description: 'Perfil criado com sucesso.' })
  @RequirePermissions('profiles.create')
  @Post()
  create(@Body() body: CreateProfileDto) {
    return this.profilesService.create(body);
  }

  @ApiOperation({ summary: 'Vincular permissões a um perfil (Substituir atual)' })
  @ApiResponse({ status: 201, description: 'Permissões vinculadas com sucesso.' })
  @RequirePermissions('profiles.assign')
  @Post(':id/permissions')
  updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProfilePermissionsDto,
  ) {
    return this.profilesService.updatePermissions(id, body);
  }

  @ApiOperation({ summary: 'Listar todos os perfis com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de perfis retornada com sucesso.' })
  @RequirePermissions('profiles.view')
  @Get()
  findAll(@Query() params: ProfileFilterDto) {
    return this.profilesService.findAll(params);
  }

  @ApiOperation({ summary: 'Buscar dados de um perfil específico pelo ID' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado.' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado.' })
  @RequirePermissions('profiles.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar os dados de um perfil existente' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado.' })
  @RequirePermissions('profiles.update')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProfileDto) {
    return this.profilesService.update(id, body);
  }

  @ApiOperation({ summary: 'Remover permanentemente um perfil (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Perfil removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado.' })
  @RequirePermissions('profiles.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.remove(id);
  }
}

import { Controller, Post, Get, Body, Query, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse , getSchemaPath, ApiExtraModels} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserFilterDto } from './dtos/user-filter.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiDefaultResponses } from '@/common/decorators/api-default-responses.decorator';
import { ErrorResponseDto } from '@/common/dtos/error-response.dto';

@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiDefaultResponses()
@ApiExtraModels(ErrorResponseDto)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Criar um novo usuário no sistema' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({
    status: 409,
    description: 'Já existe um usuário com este username ou e-mail.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 409,
        message: 'Já existe um usuário com este username ou e-mail.',
        error: 'Conflict',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('users.create')
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @ApiOperation({ summary: 'Listar todos os usuários com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
  @RequirePermissions('users.view')
  @Get()
  findAll(@Query() params: UserFilterDto) {
    return this.usersService.findAll(params);
  }

  @ApiOperation({ summary: 'Buscar dados de um usuário específico pelo ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('users.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar os dados de um usuário existente' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('users.update')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @ApiOperation({ summary: 'Remover permanentemente um usuário (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('users.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

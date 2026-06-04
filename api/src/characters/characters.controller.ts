import { Controller, Post, Get, Body, Query, Param, Patch, Delete, ParseIntPipe, ParseArrayPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth , getSchemaPath, ApiExtraModels} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dtos/create-character.dto';
import { CharacterFilterDto } from './dtos/character-filter.dto';
import { UpdateCharacterDto } from './dtos/update-character.dto';
import { ApiDefaultResponses } from '../common/decorators/api-default-responses.decorator';
import { ErrorResponseDto } from '../common/dtos/error-response.dto';

@ApiBearerAuth('access-token')
@ApiTags('Characters')
@Controller('characters')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiDefaultResponses()
@ApiExtraModels(ErrorResponseDto)
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @ApiOperation({ summary: 'Criar um novo personagem' })
  @ApiResponse({ status: 201, description: 'Personagem criado com sucesso.' })
  @ApiResponse({
    status: 409,
    description: 'Personagem com o slug informado já existe.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 409,
        message: 'Personagem com o slug informado já existe.',
        error: 'Conflict',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('characters.create')
  @Post()
  create(@Body() body: CreateCharacterDto) {
    return this.charactersService.create(body);
  }

  @ApiOperation({ summary: 'Criar múltiplos personagens em lote (Bulk)' })
  @ApiBody({ type: [CreateCharacterDto] })
  @ApiResponse({ status: 201, description: 'Personagens criados em lote com sucesso.' })
  @RequirePermissions('characters.create')
  @Post('bulk')
  createBulk(@Body(new ParseArrayPipe({ items: CreateCharacterDto })) bodies: CreateCharacterDto[]) {
    return this.charactersService.createBulk(bodies);
  }

  @ApiOperation({ summary: 'Listar personagens com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de personagens retornada com sucesso.' })
  @RequirePermissions('characters.view')
  @Get()
  findAll(@Query() params: CharacterFilterDto) {
    return this.charactersService.findAll(params);
  }

  @ApiOperation({ summary: 'Buscar personagem pelo ID' })
  @ApiResponse({ status: 200, description: 'Personagem encontrado.' })
  @ApiResponse({
    status: 404,
    description: 'Personagem não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Personagem não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('characters.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.charactersService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar um personagem existente' })
  @ApiResponse({ status: 200, description: 'Personagem atualizado com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Personagem não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Personagem não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('characters.update')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCharacterDto) {
    return this.charactersService.update(id, body);
  }

  @ApiOperation({ summary: 'Remover um personagem (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Personagem removido com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Personagem não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Personagem não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('characters.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.charactersService.remove(id);
  }
}

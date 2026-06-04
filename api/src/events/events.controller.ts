import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody , getSchemaPath, ApiExtraModels} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { EventFilterDto } from './dtos/event-filter.dto';
import { ApiDefaultResponses } from '../common/decorators/api-default-responses.decorator';
import { ErrorResponseDto } from '../common/dtos/error-response.dto';

@ApiBearerAuth('access-token')
@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiDefaultResponses()
@ApiExtraModels(ErrorResponseDto)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: 'Registrar um novo evento histórico' })
  @ApiResponse({ status: 201, description: 'Evento criado com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Contexto arco-ilha não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Contexto arco-ilha não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe um evento com esta ordem neste contexto.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 409,
        message: 'Já existe um evento com esta ordem neste contexto.',
        error: 'Conflict',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('events.create')
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @ApiOperation({ summary: 'Registrar múltiplos eventos em lote' })
  @ApiBody({ type: [CreateEventDto] })
  @ApiResponse({ status: 201, description: 'Eventos criados com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Contextos arco-ilha não encontrados.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Contextos arco-ilha não encontrados.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito de ordem no mesmo contexto arco-ilha.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 409,
        message: 'Conflito de ordem no mesmo contexto arco-ilha.',
        error: 'Conflict',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('events.create')
  @Post('bulk')
  createBulk(@Body() dtos: CreateEventDto[]) {
    return this.eventsService.createBulk(dtos);
  }

  @ApiOperation({ summary: 'Listar eventos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de eventos retornada com sucesso.' })
  @RequirePermissions('events.view')
  @Get()
  findAll(@Query() query: EventFilterDto) {
    return this.eventsService.findAll(query);
  }

  @ApiOperation({ summary: 'Buscar um evento específico pelo ID' })
  @ApiResponse({ status: 200, description: 'Evento encontrado.' })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Evento não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('events.view')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @ApiOperation({ summary: 'Listar personagens participantes de um evento' })
  @ApiResponse({ status: 200, description: 'Participantes retornados com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Evento não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('events.view')
  @Get(':id/participants')
  getParticipants(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getParticipants(id);
  }

  @ApiOperation({ summary: 'Adicionar personagem (versão) como participante de um evento' })
  @ApiBody({ schema: { properties: { character_version_id: { type: 'number', example: 1 } } } })
  @ApiResponse({ status: 201, description: 'Participante adicionado com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Evento ou versão de personagem não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Evento ou versão de personagem não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Participante já vinculado a este evento.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 409,
        message: 'Participante já vinculado a este evento.',
        error: 'Conflict',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('events.create')
  @Post(':id/participants')
  addParticipant(
    @Param('id', ParseIntPipe) id: number,
    @Body('character_version_id', ParseIntPipe) character_version_id: number,
  ) {
    return this.eventsService.addParticipant(id, character_version_id);
  }

  @ApiOperation({ summary: 'Remover personagem (versão) de um evento' })
  @ApiResponse({ status: 200, description: 'Participante removido com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Participante não encontrado neste evento.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Participante não encontrado neste evento.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('events.delete')
  @Delete(':id/participants/:character_version_id')
  removeParticipant(
    @Param('id', ParseIntPipe) id: number,
    @Param('character_version_id', ParseIntPipe) character_version_id: number,
  ) {
    return this.eventsService.removeParticipant(id, character_version_id);
  }

  @ApiOperation({ summary: 'Atualizar dados de um evento existente' })
  @ApiResponse({ status: 200, description: 'Evento atualizado com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Evento não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('events.update')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @ApiOperation({ summary: 'Remover um evento do sistema' })
  @ApiResponse({ status: 200, description: 'Evento removido com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 404,
        message: 'Evento não encontrado.',
        error: 'Not Found',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  @RequirePermissions('events.delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}


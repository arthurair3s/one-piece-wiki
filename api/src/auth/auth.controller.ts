import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse , getSchemaPath, ApiExtraModels} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ErrorResponseDto } from '../common/dtos/error-response.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiResponse({
    status: 400,
    description: 'Requisição inválida (Erro de validação ou parâmetros).',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 400,
        message: 'Requisição inválida (Erro de validação ou parâmetros).',
        error: 'Bad Request',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
@ApiExtraModels(ErrorResponseDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário (público)' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  @ApiResponse({
    status: 409,
    description: 'Usuário ou e-mail já cadastrado.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 409,
        message: 'Usuário ou e-mail já cadastrado.',
        error: 'Conflict',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Realizar login e obter token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Login realizado com sucesso.' })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas.',
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: {
        statusCode: 401,
        message: 'Credenciais inválidas.',
        error: 'Unauthorized',
        timestamp: '2026-06-03T20:42:05.123Z',
        path: '/api/example-path'
      }
    }
  })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }
}

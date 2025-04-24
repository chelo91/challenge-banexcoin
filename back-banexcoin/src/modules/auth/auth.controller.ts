import { Controller, Post, Body, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from '../../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      return this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; // Reenviar el error específico de autenticación
      }
      // Para otros errores, lanzar un error genérico
      throw new HttpException(
        'Error durante el proceso de autenticación',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 
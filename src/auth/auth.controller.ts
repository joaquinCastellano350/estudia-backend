import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service.js';
import { createUserDTO } from '../users/dto/create-user.dto.js';
import { LoginDTO } from '../users/dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  register(@Body() dto: createUserDTO) {
    return this.authService.register(dto);
  }
  @Post('login')
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request & { user: { id: string; email: string } }) {
    return req.user;
  }
}

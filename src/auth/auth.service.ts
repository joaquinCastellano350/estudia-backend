import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcryptjs';
import { createUserDTO } from '../users/dto/create-user.dto.js';
import { LoginDTO } from '../users/dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  private async hashPassowrd(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  private async validate(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async register(dto: createUserDTO) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await this.hashPassowrd(dto.password);
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });
    const payload = { sub: user?.id, email: user?.email };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
      user: {
        id: user?.id,
        name: user?.name,
        lastname: user?.lastname,
        email: user?.email,
      },
    };
  }
  async login(dto: LoginDTO) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const isValid = await this.validate(dto.password, user.hashed_password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
      user: {
        id: user?.id,
        name: user?.name,
        lastname: user?.lastname,
        email: user?.email,
      },
    };
  }
}

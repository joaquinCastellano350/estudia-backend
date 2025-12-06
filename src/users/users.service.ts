import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createUserDTO } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(data: createUserDTO) {
    try {
      return await this.prisma.user.create({
        data: {
          name: data.name,
          lastname: data.lastname,
          email: data.email,
          hashed_password: data.password,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

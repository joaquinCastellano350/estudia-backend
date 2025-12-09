import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service.js';
import { FoldersController } from './folders.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [FoldersService],
  controllers: [FoldersController],
})
export class FoldersModule {}

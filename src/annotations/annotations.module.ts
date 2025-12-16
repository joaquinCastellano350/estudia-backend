import { Module } from '@nestjs/common';
import { AnnotationsService } from './annotations.service.js';
import { AnnotationsController } from './annotations.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [AnnotationsService],
  controllers: [AnnotationsController],
})
export class AnnotationsModule {}

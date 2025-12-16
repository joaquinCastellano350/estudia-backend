import { Module } from '@nestjs/common';
import { SearchService } from './search.service.js';
import { SearchController } from './search.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}

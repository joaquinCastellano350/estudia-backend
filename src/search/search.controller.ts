import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SearchService } from './search.service.js';

@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Req() req: Request & { user: { id: string; email: string } },
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    const n = limit ? Math.min(parseInt(limit, 10) || 20, 50) : 20;
    return this.searchService.search(userId, q, n);
  }
}

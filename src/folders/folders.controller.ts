import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { FoldersService } from './folders.service.js';
import { CreateFolderDTO } from './dto/create-folder.dto.js';
import { UpdateFolderDTO } from './dto/update-folder.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  createFolder(
    @Req() req: Request & { user: { id: string; email: string } },
    @Body() dto: CreateFolderDTO,
  ) {
    return this.foldersService.createFolder(req.user.id, dto);
  }
  @Get()
  getFolders(@Req() req: Request & { user: { id: string; email: string } }) {
    return this.foldersService.getUserFolders(req.user.id);
  }
  @Patch(':id')
  updateFolder(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() dto: UpdateFolderDTO,
  ) {
    return this.foldersService.updateFolder(id, req.user.id, dto);
  }
  @Delete(':id')
  deleteFolder(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string; email: string } },
  ) {
    return this.foldersService.deleteFolder(id, req.user.id);
  }
  @Get(':id')
  getFolderById(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
  ) {
    return this.foldersService.getFolderById(id, req.user.id);
  }
}

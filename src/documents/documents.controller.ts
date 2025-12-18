import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DocumentsService } from './documents.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Req() req: Request & { user: { id: string; email: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentDto,
  ) {
    const userId = req.user.id;
    return this.documentsService.createDocument(userId, dto, file);
  }

  @Get()
  getDocuments(
    @Req() req: Request & { user: { id: string; email: string } },
    @Query('folderId') folderId?: string,
  ) {
    const userId = req.user.id;
    return this.documentsService.findAllDocuments(userId, folderId);
  }
  @Get(':id/download')
  downloadDocument(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
  ) {
    const userId = req.user.id;
    return this.documentsService.downloadDocument(userId, id);
  }
  @Get(':id')
  getDocumentById(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
  ) {
    const userId = req.user.id;
    return this.documentsService.findDocumentById(userId, id);
  }

  @Patch(':id')
  updateDocument(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    const userId = req.user.id;
    return this.documentsService.updateDocument(userId, id, dto);
  }

  @Delete(':id')
  deleteDocument(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
  ) {
    const userId = req.user.id;
    return this.documentsService.deleteDocument(userId, id);
  }
}

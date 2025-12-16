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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AnnotationsService } from './annotations.service.js';
import { CreateAnnotationDto } from './dto/create-annotation.dto.js';
import { UpdateAnnotationDto } from './dto/update-annotation.dto.js';
import { CreateReferenceDto } from './dto/create-reference.dto.js';
import { ShareAnnotationDto } from './dto/share-annotation.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Post()
  create(
    @Req() req: Request & { user: { id: string; email: string } },
    @Body() dto: CreateAnnotationDto,
  ) {
    return this.annotationsService.createAnnotation(req.user.id, dto);
  }

  @Get()
  findMine(
    @Req() req: Request & { user: { id: string; email: string } },
    @Query('documentId') documentId?: string,
  ) {
    return this.annotationsService.findUserAnnotations(req.user.id, documentId);
  }

  @Get('shared')
  findShared(@Req() req: Request & { user: { id: string; email: string } }) {
    return this.annotationsService.findSharedAnnotations(req.user.id);
  }

  @Get(':id')
  findOne(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
  ) {
    return this.annotationsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
    @Body() dto: UpdateAnnotationDto,
  ) {
    return this.annotationsService.updateAnnotation(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
  ) {
    return this.annotationsService.deleteAnnotation(req.user.id, id);
  }

  @Post('references')
  createReference(
    @Req() req: Request & { user: { id: string; email: string } },
    @Body() dto: CreateReferenceDto,
  ) {
    return this.annotationsService.addReference(req.user.id, dto);
  }
  @Delete('references/:id')
  removeReference(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('id') id: string,
  ) {
    return this.annotationsService.removeReference(req.user.id, id);
  }

  @Post('share')
  shareAnnotation(
    @Req() req: Request & { user: { id: string; email: string } },
    @Body() dto: ShareAnnotationDto,
  ) {
    {
      return this.annotationsService.shareAnnotation(req.user.id, dto);
    }
  }
  @Delete(':annotationId/share/:userId')
  unshareAnnotation(
    @Req() req: Request & { user: { id: string; email: string } },
    @Param('annotationId') annotationId: string,
    @Param('userId') userId: string,
  ) {
    return this.annotationsService.unshareAnnotation(
      req.user.id,
      annotationId,
      userId,
    );
  }
}

// CREAR INDICE UNICO EN SHARED ANNOTATIONS
// MODULO

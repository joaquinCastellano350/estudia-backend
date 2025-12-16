/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAnnotationDto } from './dto/create-annotation.dto.js';
import { UpdateAnnotationDto } from './dto/update-annotation.dto.js';
import { CreateReferenceDto } from './dto/create-reference.dto.js';
import { ShareAnnotationDto } from './dto/share-annotation.dto.js';

@Injectable()
export class AnnotationsService {
  constructor(private prisma: PrismaService) {}
  private async ensureDocumentOwner(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document || document.user_id !== userId) {
      throw new ForbiddenException('Access to document denied');
    }
    return document;
  }
  private async ensureAnnotationOwner(annotationId: string, userId: string) {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id: annotationId },
    });
    if (!annotation || annotation.user_id !== userId) {
      throw new ForbiddenException('Access to annotation denied');
    }
    return annotation;
  }
  private async ensureAnnotationAccess(annotationId: string, userId: string) {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id: annotationId },
    });
    if (!annotation) {
      throw new NotFoundException('Annotation not found');
    }
    const ownerId = annotation.user_id;
    if (ownerId === userId) {
      return { annotation, access: 'OWNER' as const };
    }
    const shared = await this.prisma.shared_annotation.findFirst({
      where: { annotation_id: annotationId, target_user: userId },
    });
    if (!shared) {
      throw new ForbiddenException('Access to annotation denied');
    }
    return { annotation, access: 'SHARED' as const };
  }
  async createAnnotation(userId: string, dto: CreateAnnotationDto) {
    await this.ensureDocumentOwner(dto.documentId, userId);
    return this.prisma.annotation.create({
      data: {
        document_id: dto.documentId,
        user_id: userId,
        title: dto.title ?? null,
        content: dto.content ?? null,
        kind: (dto.kind ?? 'NOTE') as any,
        visibility: (dto.visibility ?? 'PRIVATE') as any,
        tags: dto.tags ?? [],
      },
    });
  }
  async findUserAnnotations(userId: string, documentId?: string) {
    return this.prisma.annotation.findMany({
      where: {
        user_id: userId,
        ...(documentId ? { document_id: documentId } : {}),
      },
      orderBy: { created_at: 'desc' },
      include: { reference_annotation: true },
    });
  }
  async findSharedAnnotations(userId: string) {
    return this.prisma.shared_annotation.findMany({
      where: { target_user: userId },
      orderBy: { created_at: 'desc' },
      include: {
        annotation: { include: { reference_annotation: true } },
      },
    });
  }
  async findOne(annotationId: string, userId: string) {
    const { annotation } = await this.ensureAnnotationAccess(
      annotationId,
      userId,
    );
    return this.prisma.annotation.findUnique({
      where: { id: annotation.id },
      include: { reference_annotation: true },
    });
  }
  async updateAnnotation(
    userId: string,
    annotationId: string,
    dto: UpdateAnnotationDto,
  ) {
    await this.ensureAnnotationOwner(annotationId, userId);

    return this.prisma.annotation.update({
      where: { id: annotationId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.kind !== undefined && { kind: dto.kind }),
        ...(dto.visibility !== undefined && { visibility: dto.visibility }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        updated_at: new Date(),
      } as any,
    });
  }
  async deleteAnnotation(userId: string, annotationId: string) {
    await this.ensureAnnotationOwner(annotationId, userId);

    await this.prisma.annotation.delete({
      where: { id: annotationId },
    });
    return { deleted: true };
  }
  async addReference(userId: string, dto: CreateReferenceDto) {
    const annotation = await this.ensureAnnotationOwner(
      dto.annotationId,
      userId,
    );
    return this.prisma.reference_annotation.create({
      data: {
        annotation_id: annotation.id,
        page: dto.page ?? null,
        cite: dto.cite ?? null,
        coordinates: dto.coordinates ?? null,
      },
    });
  }
  async removeReference(userId: string, referenceId: string) {
    const reference = await this.prisma.reference_annotation.findUnique({
      where: { id: referenceId },
    });
    if (!reference) {
      throw new NotFoundException('Reference not found');
    }
    await this.ensureAnnotationOwner(reference.annotation_id, userId);

    await this.prisma.reference_annotation.delete({
      where: { id: referenceId },
    });
    return { deleted: true };
  }
  async shareAnnotation(userId: string, dto: ShareAnnotationDto) {
    const annotation = await this.ensureAnnotationOwner(
      dto.annotationId,
      userId,
    );
    const target = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
    });
    if (!target) {
      throw new NotFoundException('Target user not found');
    }
    return this.prisma.shared_annotation.upsert({
      where: {
        annotation_id_target_user: {
          annotation_id: annotation.id,
          target_user: dto.targetUserId,
        },
      } as any,
      create: {
        annotation_id: annotation.id,
        owner_id: userId,
        target_user: dto.targetUserId,
        permission: dto.permission as any,
      },
      update: {
        permission: dto.permission as any,
        updated_at: new Date(),
      },
    });
  }
  async unshareAnnotation(
    userId: string,
    annotationId: string,
    targetUserId: string,
  ) {
    await this.ensureAnnotationOwner(annotationId, userId);
    await this.prisma.shared_annotation.deleteMany({
      where: {
        annotation_id: annotationId,
        target_user: targetUserId,
        owner_id: userId,
      },
    });
    return { deleted: true };
  }
}

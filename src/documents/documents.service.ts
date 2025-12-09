/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { StorageService } from '../storage/storage.service.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';

@Injectable()
export class DocumentsService {
  private bucket: string;
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}
  private serializeDocument(document: any) {
    return {
      ...document,
      size_bytes: document.size_bytes?.toString() || document.size_bytes,
    };
  }

  private serializeDocuments(documents: any[]) {
    return documents.map((doc) => this.serializeDocument(doc));
  }

  private async ensureFolderOwner(folderId: string, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });
    if (!folder || folder.user_id !== userId) {
      throw new ForbiddenException('Access to folder denied');
    }
    return folder;
  }
  private async ensureDocumentOwner(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document || document.user_id !== userId) {
      throw new ForbiddenException('Access to document denied');
    }
    return document;
  }
  async createDocument(
    userId: string,
    dto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    let folderId: string | null = null;
    if (dto.folderId) {
      const folder = await this.ensureFolderOwner(dto.folderId, userId);
      folderId = folder.id;
    }
    const fileName = dto.name?.trim() || file.originalname;
    const { documentId, storageKey } = await this.storage.uploadFile(
      userId,
      file,
    );
    const document = await this.prisma.document.create({
      data: {
        id: documentId,
        user_id: userId,
        folder_id: folderId,
        name: fileName,
        description: dto.description || null,
        storage_key: storageKey,
        visibility: 'PRIVATE',
        mime_type: file.mimetype,
        size_bytes: file.size,
        processing_status: 'PENDING',
      },
    });
    return this.serializeDocument(document);
  }
  async findAllDocuments(userId: string, folderId?: string) {
    const documents = await this.prisma.document.findMany({
      where: { user_id: userId, ...(folderId && { folder_id: folderId }) },
      orderBy: { created_at: 'desc' },
    });
    return this.serializeDocuments(documents);
  }
  async findDocumentById(userId: string, documentId: string) {
    const document = await this.ensureDocumentOwner(documentId, userId);
    return this.serializeDocument(document);
  }
  async updateDocument(
    userId: string,
    documentId: string,
    dto: UpdateDocumentDto,
  ) {
    const document = await this.ensureDocumentOwner(documentId, userId);
    let folderId: string | null = document.folder_id;
    if (dto?.folderId !== undefined) {
      if (dto.folderId === null) {
        folderId = null;
      } else {
        const folder = await this.ensureFolderOwner(dto.folderId, userId);
        folderId = folder.id;
      }
    }
    const updatedDocument = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        ...(dto?.folderId !== undefined && { folder_id: folderId }),
        ...(dto?.name && { name: dto.name }),
        ...(dto?.description && { description: dto.description }),
        ...(dto?.visibility && { visibility: dto.visibility }),
      },
    });
    return this.serializeDocument(updatedDocument);
  }
  async deleteDocument(userId: string, documentId: string) {
    const document = await this.ensureDocumentOwner(documentId, userId);
    await this.storage.deleteFile(document.storage_key);
    await this.prisma.document.delete({ where: { id: documentId } });
    return { message: 'Document deleted successfully' };
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFolderDTO } from './dto/create-folder.dto.js';
import { UpdateFolderDTO } from './dto/update-folder.dto.js';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async ensureFolderOwner(folderId: string, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });
    if (!folder || folder.user_id !== userId) {
      throw new ForbiddenException('Unreachable folder');
    }
    return folder;
  }
  async createFolder(userId: string, dto: CreateFolderDTO) {
    let parentId: string | null = null;
    if (dto.parentId) {
      const parentFolder = await this.ensureFolderOwner(dto.parentId, userId);
      parentId = parentFolder.id;
    }
    const folder = await this.prisma.folder.create({
      data: {
        name: dto.name,
        parent_id: parentId,
        user_id: userId,
        visibility: 'PRIVATE',
      },
    });
    return folder;
  }
  async updateFolder(folderId: string, userId: string, dto: UpdateFolderDTO) {
    await this.ensureFolderOwner(folderId, userId);
    let parentId: string | null = null;
    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        parentId = null;
      } else {
        const parentFolder = await this.ensureFolderOwner(dto.parentId, userId);
        parentId = parentFolder.id;
      }
    }
    const folder = await this.prisma.folder.update({
      where: { id: folderId },
      data: {
        name: dto.name,
        ...(dto.parentId !== undefined && { parent_id: parentId }),
      },
    });
    return folder;
  }
  async deleteFolder(folderId: string, userId: string) {
    await this.ensureFolderOwner(folderId, userId);
    await this.prisma.folder.delete({ where: { id: folderId } });
  }
  async getUserFolders(userId: string) {
    return this.prisma.folder.findMany({ where: { user_id: userId } });
  }
  async getFolderById(folderId: string, userId: string) {
    const folder = await this.ensureFolderOwner(folderId, userId);
    return folder;
  }
}

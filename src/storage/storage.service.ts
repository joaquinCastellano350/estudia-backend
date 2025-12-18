/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service.js';

@Injectable()
export class StorageService {
  private bucket: string;
  constructor(private supabase: SupabaseService) {
    this.bucket = process.env.SUPABASE_BUCKET || 'documents';
  }
  async uploadFile(userId: string, file: Express.Multer.File, docId?: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const documentId = docId ?? randomUUID();
    const storageKey = `user-${userId}/${documentId}/${file.originalname}`;
    const client = this.supabase.getClient();
    const { error } = await client.storage
      .from(this.bucket)
      .upload(storageKey, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });
    if (error) {
      console.error(error);
      throw new BadRequestException('Error uploading file to storage');
    }
    return { documentId, storageKey };
  }
  async deleteFile(storageKey: string) {
    const client = this.supabase.getClient();
    const { error } = await client.storage
      .from(this.bucket)
      .remove([storageKey]);
    if (error) {
      console.error(error);
      throw new BadRequestException('Error deleting file from storage');
    }
  }
  async getDownloadUrl(storageKey: string) {
    const client = this.supabase.getClient();
    const { data, error } = await client.storage
      .from(this.bucket)
      .createSignedUrl(storageKey, 300);
    if (error) {
      console.error(error);
      throw new BadRequestException('Error creating signed URL');
    }
    return { url: data.signedUrl, expiresAt: Date.now() + 300 };
  }
}

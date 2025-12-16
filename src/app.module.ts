import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { FoldersModule } from './folders/folders.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AnnotationsModule } from './annotations/annotations.module.js';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    FoldersModule,
    SupabaseModule,
    DocumentsModule,
    StorageModule,
    AnnotationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

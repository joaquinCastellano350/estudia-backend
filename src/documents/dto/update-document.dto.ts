import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;

  @IsOptional()
  @IsString()
  visibility?: 'PRIVATE' | 'PUBLIC' | 'PUBLIC_LINK';
}

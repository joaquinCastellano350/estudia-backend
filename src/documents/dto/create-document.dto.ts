import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;
}

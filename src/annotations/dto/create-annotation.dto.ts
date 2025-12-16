import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum AnnotationKind {
  NOTE = 'NOTE',
  HIGHLIGHT = 'HIGHLIGHT',
  QUESTION = 'QUESTION',
  SUMMARY = 'SUMMARY',
  TASK = 'TASK',
}

export enum Visibility {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED',
  PUBLIC = 'PUBLIC',
}

export class CreateAnnotationDto {
  @IsUUID()
  documentId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(AnnotationKind)
  kind?: AnnotationKind;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

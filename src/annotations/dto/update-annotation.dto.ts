import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { AnnotationKind, Visibility } from './create-annotation.dto.js';

export class UpdateAnnotationDto {
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

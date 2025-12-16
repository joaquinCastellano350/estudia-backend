import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReferenceDto {
  @IsUUID()
  annotationId: string;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsString()
  cite?: string;

  @IsOptional()
  coordinates?: any;
}

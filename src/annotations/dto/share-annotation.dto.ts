import { IsEnum, IsUUID } from 'class-validator';

export enum SharePermission {
  READ = 'READ',
  WRITE = 'WRITE',
}

export class ShareAnnotationDto {
  @IsUUID()
  annotationId: string;

  @IsUUID()
  targetUserId: string;

  @IsEnum(SharePermission)
  permission: SharePermission;
}

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateFolderDTO {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

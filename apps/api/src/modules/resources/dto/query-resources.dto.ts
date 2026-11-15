import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export type ResourceSort = 'newest' | 'oldest' | 'title';

export class QueryResourcesDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  favorite?: boolean;

  @IsOptional()
  @IsIn(['newest', 'oldest', 'title'])
  sort?: ResourceSort;
}

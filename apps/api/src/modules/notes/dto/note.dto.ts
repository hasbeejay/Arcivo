import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  contentMarkdown?: string;

  @IsOptional()
  @IsUUID()
  resourceId?: string;
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  contentMarkdown?: string;

  @IsOptional()
  @IsUUID()
  resourceId?: string | null;
}

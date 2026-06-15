import { IsString, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator';

export class CreateSongDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  artist!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  album?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genres?: string[];
}

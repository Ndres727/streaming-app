import { IsString, IsOptional, IsUrl, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  displayName?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}

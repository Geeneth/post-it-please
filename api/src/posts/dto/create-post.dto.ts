import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  caption!: string;

  @IsString()
  @MinLength(2)
  platforms!: string;

  @IsOptional()
  @IsString()
  scheduledAt?: string;
}

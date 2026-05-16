import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('media', {
      storage: memoryStorage(),
      limits: {
        fileSize: 250 * 1024 * 1024,
      },
    }),
  )
  async createPost(
    @UploadedFile() mediaFile: Express.Multer.File | undefined,
    @Body() body: CreatePostDto,
  ) {
    if (!mediaFile) {
      throw new BadRequestException('A media file is required.');
    }

    if (!body.caption?.trim()) {
      throw new BadRequestException('Caption is required.');
    }

    const platforms = this.parsePlatforms(body.platforms);

    if (platforms.length === 0) {
      throw new BadRequestException('Select at least one platform.');
    }

    return this.postsService.createPost({
      mediaFile,
      caption: body.caption.trim(),
      platforms,
      scheduledAt: body.scheduledAt,
    });
  }

  private parsePlatforms(platformsJson: string): string[] {
    if (!platformsJson) {
      throw new BadRequestException('Platforms are required.');
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(platformsJson);
    } catch {
      throw new BadRequestException('Platforms must be a JSON string array.');
    }

    if (
      !Array.isArray(parsed) ||
      !parsed.every((platform) => typeof platform === 'string')
    ) {
      throw new BadRequestException('Platforms must be a JSON string array.');
    }

    return [...new Set(parsed.map((platform) => platform.trim()).filter(Boolean))];
  }
}

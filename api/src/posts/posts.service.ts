import { Injectable } from '@nestjs/common';
import { ZernioService } from '../zernio/zernio.service';

interface CreatePostInput {
  mediaFile: Express.Multer.File;
  caption: string;
  platforms: string[];
  scheduledAt?: string;
}

@Injectable()
export class PostsService {
  constructor(private readonly zernioService: ZernioService) {}

  async createPost(input: CreatePostInput) {
    const zernioResult = await this.zernioService.publishPost(input);

    return {
      message: input.scheduledAt
        ? 'Post scheduled successfully.'
        : 'Post submitted successfully.',
      zernioPostId: zernioResult.post?._id,
      status: zernioResult.post?.status,
    };
  }
}

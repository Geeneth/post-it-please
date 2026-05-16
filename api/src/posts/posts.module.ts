import { Module } from '@nestjs/common';
import { ZernioModule } from '../zernio/zernio.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [ZernioModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

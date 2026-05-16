import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsModule } from './analytics/analytics.module';
import { PostsModule } from './posts/posts.module';
import { ZernioModule } from './zernio/zernio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AnalyticsModule,
    PostsModule,
    ZernioModule,
  ],
})
export class AppModule {}

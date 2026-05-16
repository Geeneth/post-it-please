import { Module } from '@nestjs/common';
import { ZernioService } from './zernio.service';

@Module({
  providers: [ZernioService],
  exports: [ZernioService],
})
export class ZernioModule {}

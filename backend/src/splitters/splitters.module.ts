import { Module } from '@nestjs/common';
import { SplittersService } from './splitters.service';
import { SplittersController } from './splitters.controller';

@Module({
  controllers: [SplittersController],
  providers: [SplittersService],
})
export class SplittersModule {}

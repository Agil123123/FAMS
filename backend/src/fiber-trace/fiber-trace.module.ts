import { Module } from '@nestjs/common';
import { FiberTraceService } from './fiber-trace.service';
import { FiberTraceController } from './fiber-trace.controller';

@Module({
  controllers: [FiberTraceController],
  providers: [FiberTraceService],
})
export class FiberTraceModule {}

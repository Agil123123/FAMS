import { Module } from '@nestjs/common';
import { FiberSplicesService } from './fiber-splices.service';
import { FiberSplicesController } from './fiber-splices.controller';

@Module({
  controllers: [FiberSplicesController],
  providers: [FiberSplicesService],
})
export class FiberSplicesModule {}

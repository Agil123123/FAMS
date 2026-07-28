import { Module } from '@nestjs/common';
import { FiberCoresService } from './fiber-cores.service';
import { FiberCoresController } from './fiber-cores.controller';

@Module({
  controllers: [FiberCoresController],
  providers: [FiberCoresService],
})
export class FiberCoresModule {}

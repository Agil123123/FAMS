import { Module } from '@nestjs/common';
import { FiberCablesService } from './fiber-cables.service';
import { FiberCablesController } from './fiber-cables.controller';

@Module({
  controllers: [FiberCablesController],
  providers: [FiberCablesService],
})
export class FiberCablesModule {}

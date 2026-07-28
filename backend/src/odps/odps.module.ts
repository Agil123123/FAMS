import { Module } from '@nestjs/common';
import { OdpsService } from './odps.service';
import { OdpsController } from './odps.controller';

@Module({
  controllers: [OdpsController],
  providers: [OdpsService],
})
export class OdpsModule {}

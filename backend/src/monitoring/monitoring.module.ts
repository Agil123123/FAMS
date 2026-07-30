import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { RedisService } from './redis.service';

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, RedisService],
  exports: [RedisService]
})
export class MonitoringModule {}

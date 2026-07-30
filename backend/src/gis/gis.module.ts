import { Module } from '@nestjs/common';
import { GisService } from './gis.service';
import { GisController } from './gis.controller';
import { FiberLinkService } from './fiber-link.service';
import { FiberLinkController } from './fiber-link.controller';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';

@Module({
  controllers: [GisController, FiberLinkController, MonitoringController],
  providers: [GisService, FiberLinkService, MonitoringService],
})
export class GisModule {}

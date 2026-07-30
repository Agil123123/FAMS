import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('dashboard')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get aggregated monitoring dashboard stats' })
  getDashboard() {
    return this.monitoringService.getDashboardAggregate();
  }

  @Get('alarms')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get active alarms' })
  getAlarms() {
    return this.monitoringService.getAlarms();
  }

  @Patch('alarms/:id/resolve')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Resolve an active alarm' })
  resolveAlarm(@Param('id') id: string, @Request() req: any) {
    return this.monitoringService.resolveAlarm(id, req.user.id);
  }

  @Get('status')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get current device statuses' })
  getStatus() {
    return this.monitoringService.getDeviceStatuses();
  }

  @Post('heartbeat')
  @Permissions('network.write')
  @ApiOperation({ summary: 'High-speed Redis heartbeat sink for hardware devices' })
  heartbeat(@Body() payload: { device_type: string; device_id: string; status: string }) {
    return this.monitoringService.processHeartbeat(payload);
  }

  @Post('test-trigger')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Utility to trigger test alarms for UI validation' })
  triggerAlarm(@Body() payload: { device_type: string; device_id: string; severity: string; message: string }) {
    return this.monitoringService.triggerAlarm(payload);
  }
}

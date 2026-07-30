import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get monitoring config' })
  getConfig() {
    return this.monitoringService.getConfig();
  }

  @Post('config')
  @ApiOperation({ summary: 'Save monitoring config' })
  saveConfig(@Body() body: any, @Request() req: any) {
    return this.monitoringService.saveConfig(body, req.user.id);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get monitoring events' })
  getEvents() {
    return this.monitoringService.getEvents();
  }

  @Post('start')
  @ApiOperation({ summary: 'Start monitoring' })
  start() {
    return this.monitoringService.start();
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop monitoring' })
  stop() {
    return this.monitoringService.stop();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get monitoring status' })
  getStatus() {
    return this.monitoringService.getStatus();
  }
}

import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('health')
  @Permissions('system.read')
  @ApiOperation({ summary: 'Get system health status' })
  getHealth() {
    return this.systemService.getHealth();
  }

  @Post('backup')
  @Permissions('system.admin')
  @ApiOperation({ summary: 'Trigger a database backup' })
  triggerBackup() {
    return this.systemService.triggerBackup();
  }

  @Get('settings')
  @Permissions('system.read')
  @ApiOperation({ summary: 'Get system settings' })
  getSettings() {
    return this.systemService.getSettings();
  }

  @Put('settings')
  @Permissions('system.admin')
  @ApiOperation({ summary: 'Update system settings' })
  updateSettings(@Body() body: { settings: { key: string; value: string; group?: string }[] }) {
    return this.systemService.updateSettings(body.settings);
  }
}

import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpi')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Get Dashboard KPIs' })
  getKpis() {
    return this.dashboardService.getKpis();
  }

  @Get('activity')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Get recent activities' })
  getActivity() {
    return this.dashboardService.getActivity();
  }

  @Get('capacity')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Get network capacity statistics' })
  getCapacity() {
    return this.dashboardService.getCapacity();
  }

  @Get('alarm')
  @Permissions('dashboard.read')
  @ApiOperation({ summary: 'Get alarm statistics' })
  getAlarms() {
    return this.dashboardService.getAlarms();
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { GisService } from './gis.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('GIS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('gis')
export class GisController {
  constructor(private readonly gisService: GisService) {}

  @Get('assets')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all network assets as GeoJSON' })
  getAssets() {
    return this.gisService.getAssets();
  }

  @Get('customers')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all customers as GeoJSON' })
  getCustomers() {
    return this.gisService.getCustomers();
  }
}

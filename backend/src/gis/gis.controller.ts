import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
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

  @Get('odps')
  @Permissions('network.read')
  @ApiOperation({ summary: 'List all ODPs for parent selection' })
  getOdpsList() {
    return this.gisService.getOdpsList();
  }

  @Get('odps/:id/ports')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get used/free ports for an ODP' })
  getOdpPorts(@Param('id') id: string) {
    return this.gisService.getOdpPorts(id);
  }

  @Get('odps/:id')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get ODP detail — full fiber inventory' })
  getOdpDetail(@Param('id') id: string) {
    return this.gisService.getOdpDetail(id);
  }

  @Post('create')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create asset on map (ODP/Pole/Closure/Homepass)' })
  create(@Body() body: any, @Request() req: any) {
    return this.gisService.create(body, req.user.id);
  }

  @Get('splitter-types')
  @Permissions('network.read')
  @ApiOperation({ summary: 'List all splitter types' })
  getSplitterTypes() {
    return this.gisService.getSplitterTypes();
  }

  // Splice records
  @Post('odps/:id/splices')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Add splice/cross-connect record to ODP' })
  createSplice(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.gisService.createSpliceRecord(id, body, req.user.id);
  }

  @Delete('splices/:id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Delete splice record' })
  deleteSplice(@Param('id') id: string) {
    return this.gisService.deleteSpliceRecord(id);
  }

  // Splitter management
  @Post('odps/:id/splitters')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Add splitter to ODP' })
  addSplitter(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.gisService.addSplitter(id, body, req.user.id);
  }
}

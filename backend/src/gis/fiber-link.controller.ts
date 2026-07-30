import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { FiberLinkService } from './fiber-link.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Fiber Links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('fiber-links')
export class FiberLinkController {
  constructor(private readonly fiberLinkService: FiberLinkService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create ODP fiber link' })
  create(@Body() body: any, @Request() req: any) {
    return this.fiberLinkService.create(body, req.user.id);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'List all fiber links' })
  getAll() {
    return this.fiberLinkService.getAll();
  }

  @Get('geojson')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get fiber links as GeoJSON' })
  getGeoJSON() {
    return this.fiberLinkService.getGeoJSON();
  }

  @Delete(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Delete fiber link' })
  delete(@Param('id') id: string) {
    return this.fiberLinkService.delete(id);
  }
}

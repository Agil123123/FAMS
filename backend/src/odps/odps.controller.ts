import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OdpsService } from './odps.service';
import { CreateOdpDto } from './dto/create-odp.dto';
import { UpdateOdpDto } from './dto/update-odp.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('ODPs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('odps')
export class OdpsController {
  constructor(private readonly odpsService: OdpsService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create a new ODP' })
  create(@Body() createOdpDto: CreateOdpDto) {
    return this.odpsService.create(createOdpDto);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all ODPs' })
  findAll() {
    return this.odpsService.findAll();
  }

  @Get(':id')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get ODP by ID' })
  findOne(@Param('id') id: string) {
    return this.odpsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Update an ODP' })
  update(@Param('id') id: string, @Body() updateOdpDto: UpdateOdpDto) {
    return this.odpsService.update(id, updateOdpDto);
  }

  @Delete(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Delete an ODP' })
  remove(@Param('id') id: string) {
    return this.odpsService.remove(id);
  }

  @Get(':id/ports')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get ODP ports / splitters' })
  getPorts(@Param('id') id: string) {
    return this.odpsService.getPorts(id);
  }

  @Get(':id/capacity')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get ODP capacity' })
  getCapacity(@Param('id') id: string) {
    return this.odpsService.getCapacity(id);
  }

  @Get(':id/customers')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get ODP customers' })
  getCustomers(@Param('id') id: string) {
    return this.odpsService.getCustomers(id);
  }
}

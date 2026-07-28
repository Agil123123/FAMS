import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FiberCablesService } from './fiber-cables.service';
import { CreateFiberCableDto } from './dto/create-fiber-cable.dto';
import { UpdateFiberCableDto } from './dto/update-fiber-cable.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Fiber Cables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('fiber/cables')
export class FiberCablesController {
  constructor(private readonly fiberCablesService: FiberCablesService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create a new Fiber Cable' })
  create(@Body() createFiberCableDto: CreateFiberCableDto) {
    return this.fiberCablesService.create(createFiberCableDto);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all Fiber Cables' })
  findAll() {
    return this.fiberCablesService.findAll();
  }

  @Patch(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Update a Fiber Cable' })
  update(@Param('id') id: string, @Body() updateFiberCableDto: UpdateFiberCableDto) {
    return this.fiberCablesService.update(id, updateFiberCableDto);
  }

  @Delete(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Delete a Fiber Cable' })
  remove(@Param('id') id: string) {
    return this.fiberCablesService.remove(id);
  }
}

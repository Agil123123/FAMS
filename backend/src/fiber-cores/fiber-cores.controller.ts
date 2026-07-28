import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { FiberCoresService } from './fiber-cores.service';
import { UpdateFiberCoreDto } from './dto/update-fiber-core.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Fiber Cores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('fiber/cores')
export class FiberCoresController {
  constructor(private readonly fiberCoresService: FiberCoresService) {}

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all Fiber Cores' })
  findAll() {
    return this.fiberCoresService.findAll();
  }

  @Patch(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Update a Fiber Core' })
  update(@Param('id') id: string, @Body() updateFiberCoreDto: UpdateFiberCoreDto) {
    return this.fiberCoresService.update(id, updateFiberCoreDto);
  }
}

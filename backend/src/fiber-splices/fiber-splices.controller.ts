import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FiberSplicesService } from './fiber-splices.service';
import { CreateFiberSpliceDto } from './dto/create-fiber-splice.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Fiber Splices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('fiber/splices')
export class FiberSplicesController {
  constructor(private readonly fiberSplicesService: FiberSplicesService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create a new Fiber Splice' })
  create(@Body() createFiberSpliceDto: CreateFiberSpliceDto) {
    return this.fiberSplicesService.create(createFiberSpliceDto);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all Fiber Splices' })
  findAll() {
    return this.fiberSplicesService.findAll();
  }
}

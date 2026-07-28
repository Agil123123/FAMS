import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OltsService } from './olts.service';
import { CreateOltDto } from './dto/create-olt.dto';
import { UpdateOltDto } from './dto/update-olt.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('OLTs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('olts')
export class OltsController {
  constructor(private readonly oltsService: OltsService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create a new OLT' })
  create(@Body() createOltDto: CreateOltDto) {
    return this.oltsService.create(createOltDto);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all OLTs' })
  findAll() {
    return this.oltsService.findAll();
  }

  @Patch(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Update an OLT' })
  update(@Param('id') id: string, @Body() updateOltDto: UpdateOltDto) {
    return this.oltsService.update(id, updateOltDto);
  }

  @Delete(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Delete an OLT' })
  remove(@Param('id') id: string) {
    return this.oltsService.remove(id);
  }
}

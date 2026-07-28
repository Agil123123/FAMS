import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OdcsService } from './odcs.service';
import { CreateOdcDto } from './dto/create-odc.dto';
import { UpdateOdcDto } from './dto/update-odc.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('ODCs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('odcs')
export class OdcsController {
  constructor(private readonly odcsService: OdcsService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create a new ODC' })
  create(@Body() createOdcDto: CreateOdcDto) {
    return this.odcsService.create(createOdcDto);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all ODCs' })
  findAll() {
    return this.odcsService.findAll();
  }

  @Patch(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Update an ODC' })
  update(@Param('id') id: string, @Body() updateOdcDto: UpdateOdcDto) {
    return this.odcsService.update(id, updateOdcDto);
  }

  @Delete(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Delete an ODC' })
  remove(@Param('id') id: string) {
    return this.odcsService.remove(id);
  }
}

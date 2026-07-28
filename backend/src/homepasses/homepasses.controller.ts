import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { HomepassesService } from './homepasses.service';
import { CreateHomepassDto } from './dto/create-homepass.dto';
import { UpdateHomepassDto } from './dto/update-homepass.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Homepasses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('homepasses')
export class HomepassesController {
  constructor(private readonly homepassesService: HomepassesService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create a new homepass' })
  create(@Body() createHomepassDto: CreateHomepassDto, @Request() req: any) {
    return this.homepassesService.create(createHomepassDto, req.user.id);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all homepasses' })
  findAll() {
    return this.homepassesService.findAll();
  }

  @Get(':id')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get a homepass by ID' })
  findOne(@Param('id') id: string) {
    return this.homepassesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Update a homepass' })
  update(@Param('id') id: string, @Body() updateHomepassDto: UpdateHomepassDto, @Request() req: any) {
    return this.homepassesService.update(id, updateHomepassDto, req.user.id);
  }

  @Delete(':id')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Soft delete a homepass' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.homepassesService.remove(id, req.user.id);
  }
}

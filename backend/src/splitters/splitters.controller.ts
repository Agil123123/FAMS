import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SplittersService } from './splitters.service';
import { CreateSplitterDto } from './dto/create-splitter.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Splitters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('splitters')
export class SplittersController {
  constructor(private readonly splittersService: SplittersService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create a new Splitter' })
  create(@Body() createSplitterDto: CreateSplitterDto) {
    return this.splittersService.create(createSplitterDto);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all Splitters' })
  findAll() {
    return this.splittersService.findAll();
  }
}

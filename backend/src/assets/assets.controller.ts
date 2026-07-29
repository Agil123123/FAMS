import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('types')
  @Permissions('asset.read')
  @ApiOperation({ summary: 'Get asset types' })
  getTypes() {
    return this.assetsService.getTypes();
  }

  @Post()
  @Permissions('asset.create')
  @ApiOperation({ summary: 'Create a new asset' })
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @Permissions('asset.read')
  @ApiOperation({ summary: 'Get all assets' })
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  @Permissions('asset.read')
  @ApiOperation({ summary: 'Get asset by ID' })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('asset.update')
  @ApiOperation({ summary: 'Update an asset' })
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @Permissions('asset.delete')
  @ApiOperation({ summary: 'Delete an asset' })
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  @Get(':id/photos')
  @Permissions('asset.read')
  @ApiOperation({ summary: 'Get asset photos' })
  getPhotos(@Param('id') id: string) {
    return this.assetsService.getPhotos(id);
  }

  @Get(':id/documents')
  @Permissions('asset.read')
  @ApiOperation({ summary: 'Get asset documents' })
  getDocuments(@Param('id') id: string) {
    return this.assetsService.getDocuments(id);
  }

  @Get(':id/history')
  @Permissions('asset.read')
  @ApiOperation({ summary: 'Get asset history' })
  getHistory(@Param('id') id: string) {
    return this.assetsService.getHistory(id);
  }
}

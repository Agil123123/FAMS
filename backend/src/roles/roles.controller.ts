import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create new role' })
  create(@Body() createRoleDto: CreateRoleDto, @Request() req: any) {
    return this.rolesService.create(createRoleDto, req.user.id);
  }

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update role' })
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req: any,
  ) {
    return this.rolesService.update(id, updateRoleDto, req.user.id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete role' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.rolesService.remove(id, req.user.id);
  }
}



import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AddTaskDto } from './dto/add-task.dto';
import { AddPhotoDto } from './dto/add-photo.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('WorkOrders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @Permissions('network.write')
  @ApiOperation({ summary: 'Create a new work order' })
  create(@Body() createWorkOrderDto: CreateWorkOrderDto, @Request() req: any) {
    return this.workOrdersService.create(createWorkOrderDto, req.user.id);
  }

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get all work orders' })
  findAll() {
    return this.workOrdersService.findAll();
  }

  @Get(':id')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get a work order by ID' })
  findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Post(':id/status')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Update work order status and add to history log' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto, @Request() req: any) {
    return this.workOrdersService.updateStatus(id, updateStatusDto, req.user.id);
  }

  @Post(':id/tasks')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Add a task checklist item' })
  addTask(@Param('id') id: string, @Body() addTaskDto: AddTaskDto, @Request() req: any) {
    return this.workOrdersService.addTask(id, addTaskDto, req.user.id);
  }

  @Patch('tasks/:taskId/toggle')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Toggle completion status of a task checklist item' })
  toggleTask(@Param('taskId') taskId: string, @Body('is_completed') isCompleted: boolean, @Request() req: any) {
    return this.workOrdersService.toggleTask(taskId, isCompleted, req.user.id);
  }

  @Post(':id/photos')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Upload a photo for the work order' })
  addPhoto(@Param('id') id: string, @Body() addPhotoDto: AddPhotoDto, @Request() req: any) {
    return this.workOrdersService.addPhoto(id, addPhotoDto, req.user.id);
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AddTaskDto } from './dto/add-task.dto';
import { AddPhotoDto } from './dto/add-photo.dto';

@Injectable()
export class WorkOrdersService {
  constructor(private prisma: DatabaseService) {}

  async create(createWorkOrderDto: CreateWorkOrderDto, userId: string) {
    const workOrder = await this.prisma.workOrder.create({
      data: {
        ...createWorkOrderDto,
        status: 'OPEN',
        created_by: userId,
      }
    });

    await this.prisma.workOrderHistory.create({
      data: {
        work_order_id: workOrder.id,
        status: 'OPEN',
        notes: 'Work order created',
        created_by: userId
      }
    });

    return this.findOne(workOrder.id);
  }

  async findAll() {
    return this.prisma.workOrder.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      include: {
        tasks: true,
      }
    });
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { created_at: 'asc' }
        },
        photos: {
          orderBy: { created_at: 'desc' }
        },
        histories: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!workOrder || workOrder.deleted_at) {
      throw new NotFoundException(`Work Order with ID ${id} not found`);
    }

    return workOrder;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto, userId: string) {
    const workOrder = await this.findOne(id);

    // State validation could be deeply enforced here, e.g.
    // if (workOrder.status === 'CLOSED') throw new BadRequestException...

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        updated_by: userId
      }
    });

    await this.prisma.workOrderHistory.create({
      data: {
        work_order_id: id,
        status: updateStatusDto.status,
        notes: updateStatusDto.notes || `Status changed to ${updateStatusDto.status}`,
        created_by: userId
      }
    });

    return this.findOne(id);
  }

  async addTask(id: string, addTaskDto: AddTaskDto, userId: string) {
    await this.findOne(id); // Validate exists

    return this.prisma.workOrderTask.create({
      data: {
        work_order_id: id,
        description: addTaskDto.description,
        created_by: userId
      }
    });
  }

  async toggleTask(taskId: string, isCompleted: boolean, userId: string) {
    const task = await this.prisma.workOrderTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.workOrderTask.update({
      where: { id: taskId },
      data: {
        is_completed: isCompleted,
        updated_by: userId
      }
    });
  }

  async addPhoto(id: string, addPhotoDto: AddPhotoDto, userId: string) {
    await this.findOne(id);

    return this.prisma.workOrderPhoto.create({
      data: {
        work_order_id: id,
        photo_url: addPhotoDto.photo_url,
        created_by: userId
      }
    });
  }
}

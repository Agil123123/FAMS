import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: DatabaseService) {}

  async create(createRoleDto: CreateRoleDto, userId: string) {
    const { name, description, is_system, permission_ids } = createRoleDto;

    const existingRole = await this.prisma.role.findFirst({
      where: { name, deleted_at: null },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name ${name} already exists`);
    }

    const role = await this.prisma.role.create({
      data: {
        name,
        description,
        is_system: is_system ?? false,
        created_by: userId,
        role_permissions: permission_ids?.length ? {
          create: permission_ids.map(id => ({ permission_id: id }))
        } : undefined
      },
      include: {
        role_permissions: {
          include: { permission: true }
        }
      }
    });

    return role;
  }

  async findAll() {
    return this.prisma.role.findMany({
      where: { deleted_at: null },
      include: {
        role_permissions: {
          include: { permission: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, deleted_at: null },
      include: {
        role_permissions: {
          include: { permission: true }
        }
      }
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, userId: string) {
    const role = await this.findOne(id);
    
    if (role.is_system && updateRoleDto.name && updateRoleDto.name !== role.name) {
       throw new ForbiddenException('Cannot rename system roles');
    }

    const { name, description, is_system, permission_ids } = updateRoleDto;

    if (name && name !== role.name) {
      const existing = await this.prisma.role.findFirst({
        where: { name, deleted_at: null, NOT: { id } }
      });
      if (existing) {
        throw new ConflictException(`Role with name ${name} already exists`);
      }
    }

    // Prepare transaction for updating permissions if provided
    return this.prisma.$transaction(async (prisma) => {
       if (permission_ids !== undefined) {
         // Delete existing
         await prisma.rolePermission.deleteMany({
           where: { role_id: id }
         });

         if (permission_ids.length > 0) {
           await prisma.rolePermission.createMany({
             data: permission_ids.map(permId => ({
               role_id: id,
               permission_id: permId
             }))
           });
         }
       }

       const updated = await prisma.role.update({
         where: { id },
         data: {
           name: name ?? role.name,
           description: description !== undefined ? description : role.description,
           is_system: is_system !== undefined ? is_system : role.is_system,
           updated_by: userId,
         },
         include: {
           role_permissions: {
             include: { permission: true }
           }
         }
       });

       return updated;
    });
  }

  async remove(id: string, userId: string) {
    const role = await this.findOne(id);

    if (role.is_system) {
      throw new ForbiddenException('Cannot delete system roles');
    }

    await this.prisma.role.update({
      where: { id },
      data: { deleted_at: new Date(), updated_by: userId }
    });

    return { success: true, message: 'Role deleted successfully' };
  }


}

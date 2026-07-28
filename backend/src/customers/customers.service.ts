import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AssignOnuDto } from './dto/assign-onu.dto';
import { AssignPackageDto } from './dto/assign-package.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: DatabaseService) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        status: 'DRAFT',
        created_by: userId,
      },
      include: {
        odp: true,
      }
    });
  }

  async findAll() {
    return this.prisma.customer.findMany({
      where: { deleted_at: null },
      include: {
        odp: true,
        customer_onu: true,
        customer_package: {
          include: { package_profile: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        odp: true,
        customer_onu: true,
        customer_package: {
          include: { package_profile: true }
        },
        customer_documents: true
      }
    });

    if (!customer || customer.deleted_at) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string) {
    await this.findOne(id); // validates existence

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...updateCustomerDto,
        updated_by: userId
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);
    
    return this.prisma.customer.update({
      where: { id },
      data: { 
        deleted_at: new Date(),
        updated_by: userId
      },
    });
  }

  async assignOnu(id: string, assignOnuDto: AssignOnuDto, userId: string) {
    const customer = await this.findOne(id);
    
    if (customer.customer_onu) {
      // Update existing
      return this.prisma.customerOnu.update({
        where: { id: customer.customer_onu.id },
        data: {
          ...assignOnuDto,
          updated_by: userId
        }
      });
    }

    // Create new
    return this.prisma.customerOnu.create({
      data: {
        ...assignOnuDto,
        customer_id: id,
        created_by: userId
      }
    });
  }

  async assignPackage(id: string, assignPackageDto: AssignPackageDto, userId: string) {
    const customer = await this.findOne(id);
    
    if (customer.customer_package) {
      return this.prisma.customerPackage.update({
        where: { id: customer.customer_package.id },
        data: {
          package_profile_id: assignPackageDto.package_profile_id,
          updated_by: userId
        }
      });
    }

    return this.prisma.customerPackage.create({
      data: {
        customer_id: id,
        package_profile_id: assignPackageDto.package_profile_id,
        created_by: userId
      }
    });
  }

  async activate(id: string, userId: string) {
    const customer = await this.findOne(id);

    if (customer.status === 'ACTIVE') {
      throw new BadRequestException('Customer is already ACTIVE');
    }

    if (!customer.customer_onu) {
      throw new BadRequestException('Cannot activate customer without an assigned ONU');
    }

    if (!customer.customer_package) {
      throw new BadRequestException('Cannot activate customer without an assigned Billing Package');
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        updated_by: userId
      }
    });
  }

  async terminate(id: string, userId: string) {
    const customer = await this.findOne(id);

    if (customer.status === 'TERMINATED') {
      throw new BadRequestException('Customer is already TERMINATED');
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        updated_by: userId
      }
    });
  }

  async relocate(id: string, newOdpId: string, userId: string) {
    const customer = await this.findOne(id);

    if (!newOdpId) {
      throw new BadRequestException('new_odp_id is required');
    }

    // Update the ODP ID and drop the status down if active
    const newStatus = customer.status === 'ACTIVE' ? 'WAITING_INSTALLATION' : customer.status;

    return this.prisma.customer.update({
      where: { id },
      data: {
        odp_id: newOdpId,
        status: newStatus,
        updated_by: userId
      }
    });
  }
}

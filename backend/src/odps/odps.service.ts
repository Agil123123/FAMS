import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOdpDto } from './dto/create-odp.dto';
import { UpdateOdpDto } from './dto/update-odp.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OdpsService {
  constructor(private prisma: DatabaseService) {}

  async create(createOdpDto: CreateOdpDto) {
    return this.prisma.odp.create({
      data: createOdpDto,
    });
  }

  async findAll() {
    return this.prisma.odp.findMany({
      where: { deleted_at: null },
      include: {
        closure: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findOne(id: string) {
    const odp = await this.prisma.odp.findFirst({
      where: { id, deleted_at: null },
      include: {
        closure: true,
        splitters: {
          include: {
            splitter_type: true
          }
        },
        customers: true,
      }
    });
    if (!odp) {
      throw new NotFoundException(`ODP with ID ${id} not found`);
    }
    return odp;
  }

  async update(id: string, updateOdpDto: UpdateOdpDto) {
    const odp = await this.findOne(id);
    return this.prisma.odp.update({
      where: { id: odp.id },
      data: updateOdpDto,
    });
  }

  async remove(id: string) {
    const odp = await this.findOne(id);
    return this.prisma.odp.update({
      where: { id: odp.id },
      data: { deleted_at: new Date() },
    });
  }

  async getPorts(id: string) {
    const odp = await this.findOne(id);
    return this.prisma.splitter.findMany({
      where: { odp_id: odp.id, deleted_at: null },
      include: {
        splitter_type: true
      }
    });
  }

  async getCapacity(id: string) {
    // Capacity = sum of all splitter ports vs active customers
    const odp = await this.findOne(id);
    const splitters = await this.prisma.splitter.findMany({
      where: { odp_id: odp.id, deleted_at: null },
      include: { splitter_type: true }
    });
    
    const customers = await this.prisma.customer.count({
      where: { odp_id: odp.id, deleted_at: null }
    });

    let totalPorts = 0;
    // Assuming splitter_type name contains something like "1:8" or we can mock it
    // In a real scenario, splitter_type might have a `ports` field, but we assume 8 for basic simulation.
    splitters.forEach(s => {
      totalPorts += 8; // Defaulting to 8 ports per splitter for simulation
    });

    return {
      total_ports: totalPorts,
      used_ports: customers,
      available_ports: Math.max(0, totalPorts - customers),
      utilization_percentage: totalPorts > 0 ? (customers / totalPorts) * 100 : 0
    };
  }

  async getCustomers(id: string) {
    const odp = await this.findOne(id);
    return this.prisma.customer.findMany({
      where: { odp_id: odp.id, deleted_at: null }
    });
  }
}

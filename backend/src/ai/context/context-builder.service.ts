import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface FiberContext {
  customer: any;
  odp: any;
  olt: any;
  onu: any;
  topology: string[];
}

export interface CapacityContext {
  total_olts: number;
  total_odps: number;
  total_customers: number;
  customers_per_odp: { odp_name: string; customer_count: number }[];
}

export interface NetworkContext {
  total_assets: number;
  active_alarms: number;
  offline_devices: number;
  pending_work_orders: number;
  health_score: number;
}

export interface CustomerContext {
  customer: any;
  onu: any;
  work_orders: any[];
  alarm_count: number;
}

@Injectable()
export class ContextBuilderService {
  private readonly logger = new Logger(ContextBuilderService.name);

  constructor(private prisma: DatabaseService) {}

  async buildFiberContext(customerId: string): Promise<FiberContext> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    const onu = customer
      ? await this.prisma.customerOnu.findUnique({ where: { customer_id: customer.id } })
      : null;

    const odp = customer?.odp_id
      ? await this.prisma.odp.findUnique({ where: { id: customer.odp_id } })
      : null;

    const olt = await this.prisma.olt.findFirst({ where: { deleted_at: null } });

    const topology: string[] = [];
    if (customer) topology.push(`Customer: ${customer.full_name}`);
    if (onu) topology.push(`ONU: ${onu.serial_number}`);
    if (odp) topology.push(`ODP: ${odp.name}`);
    topology.push('Splitter → Closure → Fiber Cable → ODC');
    if (olt) topology.push(`OLT: ${olt.name}`);

    return { customer, odp, olt, onu, topology };
  }

  async buildCapacityContext(): Promise<CapacityContext> {
    const total_olts = await this.prisma.olt.count({ where: { deleted_at: null } });
    const total_odps = await this.prisma.odp.count({ where: { deleted_at: null } });
    const total_customers = await this.prisma.customer.count({ where: { deleted_at: null } });

    // Aggregate customers per ODP to find high-utilization nodes
    const odps = await this.prisma.odp.findMany({
      where: { deleted_at: null },
      select: { id: true, name: true, customers: { select: { id: true } } },
    });

    const customers_per_odp = odps
      .map((odp) => ({ odp_name: odp.name, customer_count: odp.customers.length }))
      .sort((a, b) => b.customer_count - a.customer_count);

    return { total_olts, total_odps, total_customers, customers_per_odp };
  }

  async buildNetworkContext(): Promise<NetworkContext> {
    const total_assets = await this.prisma.asset.count({ where: { deleted_at: null } });
    const active_alarms = await this.prisma.alarm.count({ where: { is_resolved: false } });

    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const offline_devices = await this.prisma.deviceStatus.count({
      where: { last_seen: { lt: tenMinsAgo }, deleted_at: null },
    });

    const pending_work_orders = await this.prisma.workOrder.count({
      where: {
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_SITE', 'ACCEPTED'] },
        deleted_at: null,
      },
    });

    const health_score = active_alarms === 0 ? 100 : Math.max(0, 100 - active_alarms * 5);

    return { total_assets, active_alarms, offline_devices, pending_work_orders, health_score };
  }

  async buildCustomerContext(customerId: string): Promise<CustomerContext> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    const onu = customer
      ? await this.prisma.customerOnu.findUnique({ where: { customer_id: customer.id } })
      : null;

    const work_orders = await this.prisma.workOrder.findMany({
      where: { deleted_at: null },
      take: 5,
      orderBy: { created_at: 'desc' },
    });

    const alarm_count = await this.prisma.alarm.count({ where: { is_resolved: false } });

    return { customer, onu, work_orders, alarm_count };
  }
}

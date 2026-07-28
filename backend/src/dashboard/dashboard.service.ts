import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: DatabaseService) {}

  async getKpis() {
    const totalCustomers = await this.prisma.customer.count();
    const totalHomepasses = await this.prisma.homepass.count();
    
    const workOrders = await this.prisma.workOrder.groupBy({
      by: ['status'],
      _count: { _all: true }
    });
    
    let totalOpenWorkOrders = 0;
    workOrders.forEach(wo => {
      if (['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_SITE'].includes(wo.status)) {
        totalOpenWorkOrders += wo._count._all;
      }
    });

    const alarms = await this.prisma.alarm.groupBy({
      by: ['severity'],
      where: { is_resolved: false },
      _count: { _all: true }
    });

    let criticalAlarms = 0;
    alarms.forEach(al => {
      if (al.severity.toUpperCase() === 'CRITICAL' || al.severity.toUpperCase() === 'MAJOR') {
        criticalAlarms += al._count._all;
      }
    });

    return {
      totalCustomers,
      totalHomepasses,
      totalOpenWorkOrders,
      criticalAlarms,
    };
  }

  async getActivity() {
    // Recent work order histories as activities
    const recentActivities = await this.prisma.workOrderHistory.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        work_order: {
          select: { title: true, id: true }
        }
      }
    });
    
    return recentActivities.map(activity => ({
      id: activity.id,
      title: `Work Order ${activity.status}`,
      description: activity.notes || `Work order ${activity.work_order.title} updated to ${activity.status}`,
      timestamp: activity.created_at,
      type: 'work_order'
    }));
  }

  async getCapacity() {
    // Total PON ports vs active customers (Simplified for Dashboard representation)
    const olts = await this.prisma.olt.count();
    const odcs = await this.prisma.odc.count();
    const odps = await this.prisma.odp.count();
    
    // Splitters capacity mock/calc
    const splitters = await this.prisma.splitter.findMany({
      include: { splitter_type: true }
    });
    
    let totalPorts = 0;
    splitters.forEach(sp => {
      totalPorts += sp.splitter_type.ratio_out;
    });

    const activeCustomers = await this.prisma.customer.count();
    
    return {
      olts,
      odcs,
      odps,
      totalPorts,
      usedPorts: activeCustomers,
      availablePorts: Math.max(0, totalPorts - activeCustomers),
      utilizationPercentage: totalPorts > 0 ? ((activeCustomers / totalPorts) * 100).toFixed(2) : 0
    };
  }

  async getAlarms() {
    // Alarms grouped by severity
    const alarms = await this.prisma.alarm.groupBy({
      by: ['severity'],
      where: { is_resolved: false },
      _count: { _all: true }
    });

    return alarms.map(al => ({
      severity: al.severity,
      count: al._count._all
    }));
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RedisService } from './redis.service';

@Injectable()
export class MonitoringService {
  constructor(
    private prisma: DatabaseService,
    private redis: RedisService
  ) {}

  async getDashboardAggregate() {
    const activeAlarms = await this.prisma.alarm.count({ where: { is_resolved: false, deleted_at: null } });
    
    // In a real scenario, offline devices might be calculated by last_seen threshold
    // We'll mock offline threshold as 10 minutes ago
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const offlineDevices = await this.prisma.deviceStatus.count({
      where: { last_seen: { lt: tenMinsAgo }, deleted_at: null }
    });

    const activeWorkOrders = await this.prisma.workOrder.count({
      where: {
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_SITE', 'ACCEPTED'] },
        deleted_at: null
      }
    });

    return {
      active_alarms: activeAlarms,
      offline_devices: offlineDevices,
      active_work_orders: activeWorkOrders,
      system_health: activeAlarms > 0 ? 85 : 100 // Mock KPI
    };
  }

  async getAlarms() {
    return this.prisma.alarm.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: 50
    });
  }

  async resolveAlarm(id: string, userId: string) {
    const alarm = await this.prisma.alarm.findUnique({ where: { id } });
    if (!alarm) throw new NotFoundException('Alarm not found');

    return this.prisma.alarm.update({
      where: { id },
      data: {
        is_resolved: true,
        updated_by: userId
      }
    });
  }

  async getDeviceStatuses() {
    return this.prisma.deviceStatus.findMany({
      where: { deleted_at: null },
      orderBy: { last_seen: 'desc' },
      take: 100
    });
  }

  async processHeartbeat(payload: { device_type: string; device_id: string; status: string }) {
    const cacheKey = `heartbeat:${payload.device_type}:${payload.device_id}`;
    
    // High-speed write to Redis. TTL 10 minutes (600s)
    await this.redis.setCache(cacheKey, {
      ...payload,
      last_seen: new Date().toISOString()
    }, 600);

    // In a real massive-scale system, we'd use a background cron to flush these keys to Postgres.
    // For this FAMS prototype, we'll double write to Postgres to keep it simple and ensure data persists,
    // but the architecture proves the concept.
    
    const existing = await this.prisma.deviceStatus.findFirst({
      where: { device_type: payload.device_type, device_id: payload.device_id }
    });

    if (existing) {
      return this.prisma.deviceStatus.update({
        where: { id: existing.id },
        data: {
          status: payload.status,
          last_seen: new Date()
        }
      });
    } else {
      return this.prisma.deviceStatus.create({
        data: {
          device_type: payload.device_type,
          device_id: payload.device_id,
          status: payload.status,
          last_seen: new Date()
        }
      });
    }
  }

  // Create an alarm (used for testing or by external hooks)
  async triggerAlarm(payload: { device_type: string; device_id: string; severity: string; message: string }) {
    return this.prisma.alarm.create({
      data: {
        ...payload,
        is_resolved: false
      }
    });
  }
}

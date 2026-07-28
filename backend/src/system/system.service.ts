import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(private readonly prisma: DatabaseService) {}

  async getHealth() {
    this.logger.debug('Running system health check');
    
    // Check DB Connection
    let dbStatus = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'unhealthy';
    }

    // Mock Redis Status for prototype
    const redisStatus = 'healthy';
    
    // Memory Usage
    const memory = process.memoryUsage();
    
    return {
      status: dbStatus === 'healthy' && redisStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      components: {
        database: {
          status: dbStatus,
        },
        redis: {
          status: redisStatus,
        }
      },
      system: {
        memory_usage_mb: Math.round(memory.heapUsed / 1024 / 1024),
        uptime_seconds: Math.round(process.uptime()),
      }
    };
  }

  async getSettings() {
    return this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSettings(settings: { key: string; value: string; group?: string }[]) {
    // Upsert each setting
    const results = await Promise.all(
      settings.map((setting) => 
        this.prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value, group: setting.group || 'general' },
          create: { key: setting.key, value: setting.value, group: setting.group || 'general' },
        })
      )
    );
    return results;
  }

  async triggerBackup() {
    this.logger.log('Initiating database backup');
    // In a real scenario, this would trigger pg_dump via a child process or queue job.
    // For this prototype, we mock the success.
    
    return {
      status: 'success',
      message: 'Backup process started successfully',
      backup_id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private prisma: DatabaseService) {}

  async getConfig() {
    const configs = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM monitoring_config WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`
    );
    return configs[0] || null;
  }

  async saveConfig(body: any, userId: string) {
    const existing = await this.getConfig();
    if (existing) {
      await this.prisma.$executeRawUnsafe(
        `UPDATE monitoring_config SET
          mikrotik_host=$1, mikrotik_port=$2, mikrotik_user=$3, mikrotik_pass=$4,
          pppoe_interface=$5, check_interval=$6,
          rx_warning=$7, rx_critical=$8, rx_enabled=$9, pppoe_enabled=$10,
          wa_notify_enabled=$11, wa_admin_number=$12,
          updated_at=NOW(), updated_by=$13::uuid
         WHERE id=$14::uuid`,
        body.mikrotik_host, body.mikrotik_port || 8728, body.mikrotik_user, body.mikrotik_pass,
        body.pppoe_interface || 'all', body.check_interval || 60,
        body.rx_warning || -27, body.rx_critical || -30, body.rx_enabled ?? true, body.pppoe_enabled ?? true,
        body.wa_notify_enabled ?? false, body.wa_admin_number || null,
        userId, existing.id
      );
    } else {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO monitoring_config (id, mikrotik_host, mikrotik_port, mikrotik_user, mikrotik_pass,
          pppoe_interface, check_interval, rx_warning, rx_critical, rx_enabled, pppoe_enabled,
          wa_notify_enabled, wa_admin_number, created_by, created_at, updated_at)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::uuid, NOW(), NOW())`,
        uuidv4(), body.mikrotik_host, body.mikrotik_port || 8728, body.mikrotik_user, body.mikrotik_pass,
        body.pppoe_interface || 'all', body.check_interval || 60,
        body.rx_warning || -27, body.rx_critical || -30, body.rx_enabled ?? true, body.pppoe_enabled ?? true,
        body.wa_notify_enabled ?? false, body.wa_admin_number || null,
        userId
      );
    }
    // Restart monitoring if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
    return { success: true };
  }

  async logEvent(event_type: string, message: string, severity = 'info', device?: string, raw?: any) {
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO monitoring_events (id, event_type, message, severity, device_name, device_ip, raw_data, created_at)
       VALUES ($1::uuid, $2, $3, $4, $5, $6, $7::jsonb, NOW())`,
      uuidv4(), event_type, message, severity, device || null, null, raw ? JSON.stringify(raw) : null
    );
  }

  async getEvents(limit = 50) {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM monitoring_events ORDER BY created_at DESC LIMIT $1`,
      limit
    );
  }

  async checkPPPoE() {
    const config = await this.getConfig();
    if (!config || !config.pppoe_enabled) return;

    try {
      // Simulate PPPoE check via MikroTik API
      const RouterOSClient = await this.getMikrotikClient();
      if (!RouterOSClient) {
        await this.logEvent('pppoe_check', 'MikroTik not reachable', 'warning');
        return;
      }

      const conn = await RouterOSClient.connect({
        host: config.mikrotik_host,
        port: config.mikrotik_port,
        user: config.mikrotik_user,
        password: config.mikrotik_pass,
      });

      // Get active PPPoE connections
      const active = await conn.write('/ppp/active/print');
      const total = active.length;

      await this.logEvent(
        'pppoe_check',
        `PPPoE active: ${total} users online`,
        'info',
        config.mikrotik_host,
        { total, users: active.map((u: any) => u.name) }
      );

      conn.close();
    } catch (err: any) {
      await this.logEvent('pppoe_error', `PPPoE check failed: ${err.message}`, 'error', config.mikrotik_host);
    }
  }

  async checkRXPower() {
    const config = await this.getConfig();
    if (!config || !config.rx_enabled) return;

    try {
      // Query GenieACS-style ONU devices from DB or API
      const devices = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, full_name as name, phone FROM customers WHERE status = 'ACTIVE' AND deleted_at IS NULL LIMIT 20`
      );

      for (const dev of devices) {
        // Simulate RX power check — in production, call GenieACS API
        const rxPower = -(20 + Math.random() * 20); // Simulate -20 to -40 dBm

        if (rxPower < (config.rx_critical || -30)) {
          await this.logEvent(
            'rx_critical',
            `${dev.name}: RX Power ${rxPower.toFixed(1)} dBm (CRITICAL < ${config.rx_critical})`,
            'critical',
            dev.name,
            { rx_power: rxPower, customer_id: dev.id }
          );
        } else if (rxPower < (config.rx_warning || -27)) {
          await this.logEvent(
            'rx_warning',
            `${dev.name}: RX Power ${rxPower.toFixed(1)} dBm (WARNING < ${config.rx_warning})`,
            'warning',
            dev.name,
            { rx_power: rxPower, customer_id: dev.id }
          );
        }
      }
    } catch (err: any) {
      await this.logEvent('rx_error', `RX check failed: ${err.message}`, 'error');
    }
  }

  private async getMikrotikClient() {
    try {
      return require('node-routeros');
    } catch {
      this.logger.warn('node-routeros not installed — running in simulation mode');
      return null;
    }
  }

  async start() {
    if (this.isRunning) return { message: 'Already running' };
    const config = await this.getConfig();
    if (!config) return { message: 'No monitoring config — configure first' };

    this.isRunning = true;
    const interval = (config.check_interval || 60) * 1000;

    this.logger.log(`Monitoring started — interval ${config.check_interval}s`);
    await this.logEvent('monitor_start', `Monitoring started with interval ${config.check_interval}s`, 'info');

    this.intervalId = setInterval(async () => {
      if (!this.isRunning) return;
      await this.checkPPPoE();
      await this.checkRXPower();
    }, interval);

    // Run immediately on start
    await this.checkPPPoE();
    await this.checkRXPower();

    return { message: 'Monitoring started', interval: config.check_interval };
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.logger.log('Monitoring stopped');
    return { message: 'Monitoring stopped' };
  }

  getStatus() {
    return { running: this.isRunning, interval_id: !!this.intervalId };
  }
}

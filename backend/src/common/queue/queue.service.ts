// ==========================================================
// Queue Service
// Generic job producer for BullMQ
// ==========================================================

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('notification') private notificationQueue: Queue,
    @InjectQueue('audit') private auditQueue: Queue,
    @InjectQueue('email') private emailQueue: Queue,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Add a job to the notification queue
   */
  async addNotificationJob(name: string, data: Record<string, unknown>) {
    const job = await this.notificationQueue.add(name, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    this.logger.debug(`Notification job added: ${job.id}`, 'QueueService');
    return job;
  }

  /**
   * Add a job to the audit queue
   */
  async addAuditJob(data: {
    userId?: string;
    action: string;
    module: string;
    entityType: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const job = await this.auditQueue.add('audit-log', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    this.logger.debug(`Audit job added: ${job.id}`, 'QueueService');
    return job;
  }

  /**
   * Add a job to the email queue
   */
  async addEmailJob(data: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, unknown>;
  }) {
    const job = await this.emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
    this.logger.debug(`Email job added: ${job.id}`, 'QueueService');
    return job;
  }
}

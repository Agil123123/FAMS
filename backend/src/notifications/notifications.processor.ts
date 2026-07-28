import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationPayload } from './notifications.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private prisma: DatabaseService) {
    super();
  }

  async process(job: Job<NotificationPayload>): Promise<any> {
    const { data } = job;
    this.logger.log(`Processing notification job ${job.id} for user ${data.user_id}`);

    let notificationRecord = null;

    try {
      // 1. Always create the In-App record if requested, as it serves as the base entity
      if (data.channels.includes('IN_APP')) {
        notificationRecord = await this.prisma.notification.create({
          data: {
            user_id: data.user_id,
            title: data.title,
            message: data.message,
            type: data.type
          }
        });
      }

      // 2. Process external channels (Simulated for this prototype)
      if (data.channels.includes('EMAIL')) {
        this.logger.log(`[EXTERNAL_API_CALL] Sending EMAIL to user ${data.user_id}...`);
        await new Promise(r => setTimeout(r, 500)); // Simulate latency
      }

      if (data.channels.includes('TELEGRAM')) {
        this.logger.log(`[EXTERNAL_API_CALL] Sending TELEGRAM message to user ${data.user_id}...`);
        await new Promise(r => setTimeout(r, 300));
      }

      if (data.channels.includes('WHATSAPP')) {
        this.logger.log(`[EXTERNAL_API_CALL] Sending WHATSAPP message to user ${data.user_id}...`);
        await new Promise(r => setTimeout(r, 400));
      }

      // 3. Log success
      if (notificationRecord) {
        await this.prisma.notificationLog.create({
          data: {
            notification_id: notificationRecord.id,
            status: 'SUCCESS'
          }
        });
      }

      return { status: 'delivered', channels: data.channels };

    } catch (error: any) {
      this.logger.error(`Failed to process notification job ${job.id}`, error.stack);
      
      if (notificationRecord) {
        await this.prisma.notificationLog.create({
          data: {
            notification_id: notificationRecord.id,
            status: 'FAILED',
            error_message: error.message
          }
        });
      }
      
      throw error; // Trigger BullMQ retry mechanism
    }
  }
}

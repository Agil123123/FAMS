import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type: string;
  channels: ('IN_APP' | 'EMAIL' | 'TELEGRAM' | 'WHATSAPP')[];
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: DatabaseService,
    @InjectQueue('notifications') private notificationsQueue: Queue
  ) {}

  async queueNotification(payload: NotificationPayload) {
    this.logger.log(`Queueing multi-channel notification for user ${payload.user_id}`);
    
    // Push the job onto the BullMQ Redis queue
    await this.notificationsQueue.add('send-notification', payload, {
      removeOnComplete: true,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });

    return { success: true, message: 'Notification queued for asynchronous delivery' };
  }

  async getInAppNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: 50
    });
  }
}

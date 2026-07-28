import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService, NotificationPayload } from './notifications.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Permissions('network.read')
  @ApiOperation({ summary: 'Get in-app notifications for the current user' })
  getInAppNotifications(@Request() req: any) {
    return this.notificationsService.getInAppNotifications(req.user.id);
  }

  @Post('test')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Dispatch a multi-channel notification (Simulated integration)' })
  testNotification(@Request() req: any, @Body() payload: { title: string; message: string; type: string; channels: string[] }) {
    const notification: NotificationPayload = {
      user_id: req.user.id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      channels: payload.channels as any
    };
    return this.notificationsService.queueNotification(notification);
  }
}

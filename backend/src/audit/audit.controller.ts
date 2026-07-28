import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions('audit_log.read')
  @ApiOperation({ summary: 'Get audit logs with pagination and filtering' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'module', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'entityId', required: false, type: String })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  getAuditLogs(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('entityId') entityId?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.auditService.getAuditLogs({
      skip, take, module, action, userId, entityId, entityType
    });
  }
}

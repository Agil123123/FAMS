import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @Permissions('network.read')
  @ApiOperation({ summary: 'AI Chat — ask the FAMS assistant a question' })
  chat(@Body() body: { message: string }) {
    return this.aiService.chat(body.message);
  }

  @Post('fiber-trace')
  @Permissions('network.read')
  @ApiOperation({ summary: 'AI Fiber Trace — analyze a customer fiber path' })
  fiberTrace(@Body() body: { customer_id: string }) {
    return this.aiService.fiberTrace(body.customer_id);
  }

  @Post('nearest-odp')
  @Permissions('network.read')
  @ApiOperation({ summary: 'AI Nearest ODP — find closest ODPs with PostGIS' })
  nearestOdp(@Body() body: { lat: number; lng: number }) {
    return this.aiService.nearestOdp(body.lat, body.lng);
  }

  @Post('capacity-analysis')
  @Permissions('network.read')
  @ApiOperation({ summary: 'AI Capacity Analysis — assess port utilization' })
  capacityAnalysis() {
    return this.aiService.capacityAnalysis();
  }

  @Post('network-analysis')
  @Permissions('network.read')
  @ApiOperation({ summary: 'AI Network Analysis — full health assessment' })
  networkAnalysis() {
    return this.aiService.networkAnalysis();
  }

  @Post('recommendation')
  @Permissions('network.read')
  @ApiOperation({ summary: 'AI Recommendations — prioritized operational actions' })
  recommendation() {
    return this.aiService.recommendation();
  }
}

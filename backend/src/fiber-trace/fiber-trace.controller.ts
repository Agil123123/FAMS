import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FiberTraceService } from './fiber-trace.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Fiber Trace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('fiber/trace')
export class FiberTraceController {
  constructor(private readonly fiberTraceService: FiberTraceService) {}

  @Get('customer/:id')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Trace network from a Customer' })
  traceFromCustomer(@Param('id') id: string) {
    return this.fiberTraceService.traceFromCustomer(id);
  }

  @Get('odp/:id')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Trace network from an ODP' })
  traceFromOdp(@Param('id') id: string) {
    return this.fiberTraceService.traceFromOdp(id);
  }

  @Get('core/:id')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Trace network from a Fiber Core' })
  traceFromCore(@Param('id') id: string) {
    return this.fiberTraceService.traceFromCore(id);
  }
}

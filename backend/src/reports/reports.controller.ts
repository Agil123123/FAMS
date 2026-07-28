import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Response } from 'express';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export/excel')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Export network data as Excel' })
  async exportExcel(@Res() res: Response) {
    const buffer = await this.reportsService.generateExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="FAMS-Report.xlsx"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('export/csv')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Export network data as CSV' })
  async exportCsv(@Res() res: Response) {
    const csv = await this.reportsService.generateCsv();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="FAMS-Report.csv"',
    });
    res.end(csv);
  }

  @Get('export/pdf')
  @Permissions('network.read')
  @ApiOperation({ summary: 'Export network data as PDF' })
  async exportPdf(@Res() res: Response) {
    const buffer = await this.reportsService.generatePdf();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="FAMS-Report.pdf"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post('schedule')
  @Permissions('network.write')
  @ApiOperation({ summary: 'Schedule a recurring report' })
  scheduleReport(@Body() payload: { frequency: string; email: string }) {
    return this.reportsService.scheduleReport(payload.frequency, payload.email);
  }
}

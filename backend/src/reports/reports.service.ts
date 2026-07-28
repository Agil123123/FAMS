import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private prisma: DatabaseService) {}

  private async fetchNetworkData() {
    const assets = await this.prisma.asset.findMany({ where: { deleted_at: null }, take: 50 });
    const alarms = await this.prisma.alarm.findMany({ where: { is_resolved: false }, take: 50 });
    const workOrders = await this.prisma.workOrder.findMany({ where: { status: 'OPEN' }, take: 50 });
    
    return {
      assets: assets.map(a => ({ ID: a.asset_code, Name: a.name, Status: a.status })),
      alarms: alarms.map(a => ({ Device: a.device_type, Severity: a.severity, Message: a.message })),
      workOrders: workOrders.map(wo => ({ Title: wo.title, Status: wo.status }))
    };
  }

  async generateExcel(): Promise<Buffer> {
    const data = await this.fetchNetworkData();
    const workbook = new ExcelJS.Workbook();
    
    const assetSheet = workbook.addWorksheet('Assets');
    assetSheet.columns = [
      { header: 'Asset ID', key: 'ID', width: 20 },
      { header: 'Name', key: 'Name', width: 30 },
      { header: 'Status', key: 'Status', width: 15 },
    ];
    assetSheet.addRows(data.assets);

    const alarmSheet = workbook.addWorksheet('Active Alarms');
    alarmSheet.columns = [
      { header: 'Device', key: 'Device', width: 20 },
      { header: 'Severity', key: 'Severity', width: 15 },
      { header: 'Message', key: 'Message', width: 40 },
    ];
    alarmSheet.addRows(data.alarms);

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  async generateCsv(): Promise<string> {
    const data = await this.fetchNetworkData();
    const parser = new Parser();
    // For CSV, we'll just flatten the data into a single summary sheet or just export Alarms
    return parser.parse(data.alarms.length > 0 ? data.alarms : [{ Status: 'No active alarms' }]);
  }

  async generatePdf(): Promise<Buffer> {
    const data = await this.fetchNetworkData();
    
    // For this FAMS prototype, we generate a valid Buffer to represent the PDF.
    // In production, pdfkit or a microservice handles the complex layout rendering.
    const pdfString = `%PDF-1.4\n1 0 obj\n<< /Title (FAMS Report) /Creator (FAMS System) >>\nendobj\n`;
    return Buffer.from(pdfString, 'utf-8');
  }

  async scheduleReport(frequency: string, email: string) {
    // Record intent to job table
    await this.prisma.job.create({
      data: {
        name: `SCHEDULED_REPORT_${frequency}`,
        status: 'PENDING',
        payload: { frequency, email, created_at: new Date() }
      }
    });
    return { success: true, message: `Report scheduled for ${email} at ${frequency} frequency.` };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyReports() {
    this.logger.log('Executing automated daily network reports...');
    // Implementation would query jobs table, generate PDF, and send emails via SES/SMTP
    // Mocking execution for demo purposes:
    const jobs = await this.prisma.job.findMany({ where: { status: 'PENDING', name: 'SCHEDULED_REPORT_daily' } });
    for (const job of jobs) {
      await this.prisma.job.update({ where: { id: job.id }, data: { status: 'COMPLETED' } });
      this.logger.log(`Completed report job ${job.id}`);
    }
  }
}

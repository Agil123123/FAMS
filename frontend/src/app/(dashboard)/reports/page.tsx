'use client';

import React, { useState } from 'react';
import { useExportExcel, useExportCsv, useExportPdf, useScheduleReport } from '@/hooks/use-reports';
import { FileSpreadsheet, FileText, FileDown, CalendarClock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ReportsPage() {
  const exportExcel = useExportExcel();
  const exportCsv = useExportCsv();
  const exportPdf = useExportPdf();
  const scheduleReport = useScheduleReport();

  const [scheduleForm, setScheduleForm] = useState({ frequency: 'daily', email: '' });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.email) return;
    scheduleReport.mutate(scheduleForm, {
      onSuccess: () => setScheduleForm({ ...scheduleForm, email: '' })
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reporting Center</h1>
        <p className="text-muted-foreground mt-1">Export, analyze, and automate network data deliveries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Manual Export Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Exports</CardTitle>
              <CardDescription>Instantly generate standard network reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 text-green-600 dark:bg-green-900/30 rounded-full">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Excel Report</h4>
                    <p className="text-xs text-muted-foreground">Network overview in .xlsx format</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => exportExcel.mutate()} 
                  disabled={exportExcel.isPending}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  {exportExcel.isPending ? 'Generating...' : 'Download'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-full">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">CSV Report</h4>
                    <p className="text-xs text-muted-foreground">Raw alarm data for external parsing</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => exportCsv.mutate()} 
                  disabled={exportCsv.isPending}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  {exportCsv.isPending ? 'Generating...' : 'Download'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 rounded-full">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">PDF Report</h4>
                    <p className="text-xs text-muted-foreground">Print-ready tabulated document</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => exportPdf.mutate()} 
                  disabled={exportPdf.isPending}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  {exportPdf.isPending ? 'Generating...' : 'Download'}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Scheduled Automated Reports */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarClock className="w-5 h-5 mr-2 text-purple-500" />
                Automated Delivery
              </CardTitle>
              <CardDescription>Schedule recurring emails of the network health status.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleSubmit} className="space-y-4 bg-muted/20 p-4 rounded-lg border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Frequency</label>
                  <select 
                    className="w-full border p-2 rounded-md bg-background"
                    value={scheduleForm.frequency}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                  >
                    <option value="daily">Daily Midnight Digest</option>
                    <option value="weekly">Weekly Summary (Mon 08:00)</option>
                    <option value="monthly">Monthly Audit</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Email</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="noc-team@provider.com"
                    className="w-full border p-2 rounded-md bg-background"
                    value={scheduleForm.email}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, email: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={scheduleReport.isPending || !scheduleForm.email}>
                  <Send className="w-4 h-4 mr-2" />
                  {scheduleReport.isPending ? 'Scheduling...' : 'Configure Automated Report'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

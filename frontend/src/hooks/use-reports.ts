import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '../lib/api/reports';
import { toast } from 'sonner';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const useExportExcel = () => {
  return useMutation({
    mutationFn: reportsApi.exportExcel,
    onSuccess: (blob) => {
      downloadBlob(blob, 'FAMS-Report.xlsx');
      toast.success('Excel report downloaded');
    },
    onError: () => toast.error('Failed to generate Excel report')
  });
};

export const useExportCsv = () => {
  return useMutation({
    mutationFn: reportsApi.exportCsv,
    onSuccess: (blob) => {
      downloadBlob(blob, 'FAMS-Report.csv');
      toast.success('CSV report downloaded');
    },
    onError: () => toast.error('Failed to generate CSV report')
  });
};

export const useExportPdf = () => {
  return useMutation({
    mutationFn: reportsApi.exportPdf,
    onSuccess: (blob) => {
      downloadBlob(blob, 'FAMS-Report.pdf');
      toast.success('PDF report downloaded');
    },
    onError: () => toast.error('Failed to generate PDF report')
  });
};

export const useScheduleReport = () => {
  return useMutation({
    mutationFn: reportsApi.scheduleReport,
    onSuccess: () => {
      toast.success('Report scheduled successfully');
    },
    onError: () => toast.error('Failed to schedule report')
  });
};

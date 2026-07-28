'use client';

import React, { useState } from 'react';
import { useSystemBackup } from '@/hooks/use-system';
import { DatabaseBackup, Loader2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function BackupPage() {
  const backupMutation = useSystemBackup();
  const [lastBackup, setLastBackup] = useState<any>(null);

  const handleBackup = () => {
    backupMutation.mutate(undefined, {
      onSuccess: (data) => {
        setLastBackup(data);
      }
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <DatabaseBackup className="w-8 h-8 mr-3 text-primary" />
            System Backup
          </h1>
          <p className="text-muted-foreground mt-1">Manual disaster recovery snapshot generation</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Create Manual Backup</CardTitle>
            <CardDescription>Trigger an immediate pg_dump of the entire Postgres database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Encrypted Snapshot</p>
                Backups are fully encrypted at rest using AES-256 and stored in the secure vault.
              </div>
            </div>

            <Button onClick={handleBackup} disabled={backupMutation.isPending} className="w-full h-12 text-lg font-bold">
              {backupMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Backup...
                </>
              ) : (
                <>
                  <DatabaseBackup className="w-5 h-5 mr-2" />
                  Start Backup Process
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup Status</CardTitle>
            <CardDescription>Results of the last manual run</CardDescription>
          </CardHeader>
          <CardContent>
            {lastBackup ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-lg flex-col text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
                  <h3 className="font-bold text-green-700 dark:text-green-400 text-lg">Backup Successful</h3>
                  <p className="text-xs text-green-600/80 mt-1">{lastBackup.message}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-muted-foreground">Backup ID</span>
                    <span className="font-mono">{lastBackup.backup_id}</span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span>{new Date(lastBackup.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No backup initiated this session</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

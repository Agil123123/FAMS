'use client';

import React, { useState } from 'react';
import { useAuditLogs } from '@/hooks/use-audit';
import { ShieldAlert, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [moduleFilter, setModuleFilter] = useState('');
  const take = 20;

  const { data, isLoading } = useAuditLogs({
    skip: page * take,
    take,
    module: moduleFilter || undefined,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <ShieldAlert className="w-8 h-8 mr-3 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">Immutable record of system activities</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-8" 
            placeholder="Filter by Module..." 
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>User / IP</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{log.user?.username || log.user_id || 'System'}</div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold">
                          {log.module}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                          log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-700' :
                          log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">
                          {log.entity_type} {log.entity_id ? `(${log.entity_id.substring(0, 8)}...)` : ''}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {data && data.total > take && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <p className="text-xs text-muted-foreground">
                Showing {page * take + 1} to {Math.min((page + 1) * take, data.total)} of {data.total} entries
              </p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * take >= data.total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

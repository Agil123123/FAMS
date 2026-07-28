'use client';

import React, { useEffect, useState } from 'react';
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/use-system';
import { Save, Settings2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();
  
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const initial = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
      
      // Default fallback if settings are empty
      if (!initial['maintenance_mode']) initial['maintenance_mode'] = 'false';
      if (!initial['system_email']) initial['system_email'] = 'admin@fams.com';
      if (!initial['max_upload_size_mb']) initial['max_upload_size_mb'] = '50';
      if (!initial['theme']) initial['theme'] = 'system';
      
      setFormData(initial);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload = Object.entries(formData).map(([key, value]) => ({ key, value }));
    updateSettings.mutate(payload);
  };

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Settings2 className="w-8 h-8 mr-3 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure global FAMS operational parameters</p>
        </div>
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Configuration</CardTitle>
            <CardDescription>Basic system identifiers and defaults</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">System Admin Email</label>
              <Input 
                value={formData['system_email'] || ''} 
                onChange={(e) => handleChange('system_email', e.target.value)} 
                type="email"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Maintenance Mode</label>
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData['maintenance_mode'] || 'false'}
                onChange={(e) => handleChange('maintenance_mode', e.target.value)}
              >
                <option value="false">Disabled - Normal Operation</option>
                <option value="true">Enabled - System Offline</option>
              </select>
              <p className="text-[10px] text-muted-foreground">When enabled, only administrators can access the system.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage & Media</CardTitle>
            <CardDescription>File upload constraints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Max Upload Size (MB)</label>
              <Input 
                value={formData['max_upload_size_mb'] || ''} 
                onChange={(e) => handleChange('max_upload_size_mb', e.target.value)} 
                type="number"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

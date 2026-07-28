'use client';

import React, { useState } from 'react';
import { useInAppNotifications, useTestNotification } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, Mail, MessageSquare, Smartphone, Zap, CheckCircle2, AlertTriangle, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useInAppNotifications();
  const testNotification = useTestNotification();

  const [testForm, setTestForm] = useState({
    title: 'Emergency Power Loss',
    message: 'OLT-Central is offline. Dispatch required.',
    type: 'ALARM',
    channels: ['IN_APP', 'EMAIL', 'TELEGRAM']
  });

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    testNotification.mutate(testForm);
  };

  const toggleChannel = (channel: string) => {
    setTestForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel) 
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'ALARM': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'WORK_ORDER': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
        <p className="text-muted-foreground mt-1">Multi-channel delivery settings and inbox</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Inbox */}
        <div className="md:col-span-2 space-y-6">
          <Card className="h-full border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-500" />
                In-App Inbox
              </CardTitle>
              <CardDescription>Your personal application alerts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading notifications...</div>
              ) : (
                <div className="space-y-4">
                  {notifications?.map(notif => (
                    <div key={notif.id} className="p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors flex items-start space-x-4">
                      <div className="mt-1 bg-muted p-2 rounded-full">
                        {getIconForType(notif.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-foreground">{notif.title}</h4>
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                      </div>
                    </div>
                  ))}

                  {(!notifications || notifications.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p>You have no notifications.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Developer / Delivery Tester */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Multi-Channel Dispatch
              </CardTitle>
              <CardDescription>Test the BullMQ delivery pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alert Title</label>
                  <input 
                    className="w-full border p-2 rounded-md bg-background text-sm"
                    value={testForm.title}
                    onChange={e => setTestForm({...testForm, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Body</label>
                  <textarea 
                    className="w-full border p-2 rounded-md bg-background text-sm h-20"
                    value={testForm.message}
                    onChange={e => setTestForm({...testForm, message: e.target.value})}
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium">Delivery Channels (BullMQ Job Data)</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { id: 'IN_APP', label: 'In-App', icon: <Bell className="w-3 h-3" /> },
                      { id: 'EMAIL', label: 'Email', icon: <Mail className="w-3 h-3" /> },
                      { id: 'TELEGRAM', label: 'Telegram', icon: <Smartphone className="w-3 h-3" /> },
                      { id: 'WHATSAPP', label: 'WhatsApp', icon: <MessageSquare className="w-3 h-3" /> }
                    ].map(channel => (
                      <div 
                        key={channel.id} 
                        onClick={() => toggleChannel(channel.id)}
                        className={`flex items-center p-2 rounded border cursor-pointer transition-colors text-xs font-semibold
                          ${testForm.channels.includes(channel.id) ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-card text-muted-foreground'}
                        `}
                      >
                        <span className="mr-2">{channel.icon}</span>
                        {channel.label}
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={testNotification.isPending || testForm.channels.length === 0}>
                  {testNotification.isPending ? 'Queueing Job...' : 'Dispatch Job Queue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

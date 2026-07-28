'use client';

import React, { useState } from 'react';
import { useAiChat, useAiCapacity, useAiNetwork, useAiRecommendation } from '@/hooks/use-ai';
import { 
  Bot, Send, Activity, BarChart3, Lightbulb, Cable, AlertTriangle, CheckCircle2, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  data?: any;
  timestamp: Date;
}

const RenderAiResponse = ({ data }: { data: any }) => {
  if (!data) return null;

  if (data.type === 'network_analysis') {
    return (
      <div className="space-y-3 mt-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold text-green-500">{data.health_score}%</p>
            <p className="text-[10px] text-muted-foreground">Health Score</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold text-red-500">{data.metrics?.active_alarms || 0}</p>
            <p className="text-[10px] text-muted-foreground">Active Alarms</p>
          </div>
        </div>
        {data.attention_areas?.length > 0 && (
          <div className="p-3 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">Attention Areas</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {data.attention_areas.map((a: string, i: number) => <li key={i}>• {a}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (data.type === 'capacity_analysis') {
    return (
      <div className="space-y-3 mt-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-muted rounded text-center">
            <p className="text-lg font-bold">{data.summary?.total_olts}</p>
            <p className="text-[10px] text-muted-foreground">OLTs</p>
          </div>
          <div className="p-2 bg-muted rounded text-center">
            <p className="text-lg font-bold">{data.summary?.total_odps}</p>
            <p className="text-[10px] text-muted-foreground">ODPs</p>
          </div>
          <div className="p-2 bg-muted rounded text-center">
            <p className="text-lg font-bold">{data.summary?.total_customers}</p>
            <p className="text-[10px] text-muted-foreground">Customers</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{data.message}</p>
      </div>
    );
  }

  if (data.type === 'recommendation') {
    return (
      <div className="space-y-2 mt-3">
        {data.recommendations?.map((rec: any, i: number) => (
          <div key={i} className="p-3 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">{rec.title}</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full 
                ${rec.priority === 'HIGH' ? 'bg-red-100 text-red-700' : rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                {rec.priority}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{rec.description}</p>
            <span className="text-[10px] text-blue-500 font-mono mt-1 inline-block">{rec.category}</span>
          </div>
        ))}
      </div>
    );
  }

  if (data.type === 'fiber_trace') {
    const a = data.analysis;
    return (
      <div className="space-y-3 mt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{a?.customer_name}</span>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${a?.health_score >= 80 ? 'bg-green-100 text-green-700' : a?.health_score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            Health: {a?.health_score}%
          </span>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-[10px] font-semibold text-muted-foreground mb-2">TOPOLOGY CHAIN</p>
          {a?.topology_chain?.map((node: string, i: number) => (
            <div key={i} className="flex items-center text-xs py-1">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] mr-2">{i + 1}</span>
              {node}
            </div>
          ))}
        </div>
        {a?.issues?.length > 0 && (
          <div className="space-y-1">
            {a.issues.map((issue: string, i: number) => (
              <div key={i} className="flex items-start space-x-2 text-xs text-red-600">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback: render message
  return <p className="text-sm text-muted-foreground mt-2">{data.message || JSON.stringify(data)}</p>;
};

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const chatMutation = useAiChat();
  const capacityMutation = useAiCapacity();
  const networkMutation = useAiNetwork();
  const recommendMutation = useAiRecommendation();

  const isLoading = chatMutation.isPending || capacityMutation.isPending || networkMutation.isPending || recommendMutation.isPending;

  const addMessage = (role: 'user' | 'ai', content: string, data?: any) => {
    setMessages((prev) => [...prev, { role, content, data, timestamp: new Date() }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    addMessage('user', msg);

    chatMutation.mutate(msg, {
      onSuccess: (data) => addMessage('ai', data.message || 'Analysis complete.', data),
      onError: () => addMessage('ai', 'Sorry, I encountered an error processing your request.'),
    });
  };

  const handleQuickAction = (action: string) => {
    addMessage('user', action);
    const mutation = action.includes('Capacity') ? capacityMutation 
      : action.includes('Network') ? networkMutation 
      : recommendMutation;

    mutation.mutate(undefined as any, {
      onSuccess: (data) => addMessage('ai', 'Analysis complete.', data),
      onError: () => addMessage('ai', 'Sorry, I encountered an error.'),
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground mt-1">Intelligent network analysis and recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Chat Panel */}
        <div className="md:col-span-3">
          <Card className="border-t-4 border-t-violet-500 h-[600px] flex flex-col">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center text-sm">
                <Bot className="w-5 h-5 mr-2 text-violet-500" />
                FAMS Intelligence Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Bot className="w-16 h-16 text-violet-500/30 mb-4" />
                  <p className="text-sm font-medium">Ask me anything about your FAMS network.</p>
                  <p className="text-xs mt-1">Try: "What is the network health?" or "Show capacity analysis"</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.data && <RenderAiResponse data={msg.data} />}
                    <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-violet-200' : 'text-muted-foreground'}`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg rounded-bl-none flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                    <span className="text-sm text-muted-foreground">Analyzing...</span>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  className="flex-1 border rounded-lg p-2 bg-background text-sm"
                  placeholder="Ask about network health, capacity, fiber traces..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-violet-600 hover:bg-violet-700 text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Analysis</CardTitle>
              <CardDescription className="text-xs">One-click intelligence reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-xs" onClick={() => handleQuickAction('Run Network Health Analysis')} disabled={isLoading}>
                <Activity className="w-4 h-4 mr-2 text-green-500" />
                Network Health
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs" onClick={() => handleQuickAction('Run Capacity Analysis')} disabled={isLoading}>
                <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                Capacity Report
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs" onClick={() => handleQuickAction('Generate Recommendations')} disabled={isLoading}>
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

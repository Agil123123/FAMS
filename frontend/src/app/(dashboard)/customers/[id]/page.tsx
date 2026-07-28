'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useCustomer, 
  useAssignOnu, 
  useAssignPackage, 
  useActivateCustomer, 
  useTerminateCustomer, 
  useRelocateCustomer 
} from '@/hooks/use-customers';
import { format } from 'date-fns';
import { 
  User, Router, CreditCard, Activity, XCircle, MapPin, ChevronLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const { data: customer, isLoading } = useCustomer(customerId);
  const assignOnu = useAssignOnu();
  const assignPackage = useAssignPackage();
  const activate = useActivateCustomer();
  const terminate = useTerminateCustomer();
  const relocate = useRelocateCustomer();

  const [onuSerial, setOnuSerial] = useState('');
  const [packageId, setPackageId] = useState('');
  const [newOdpId, setNewOdpId] = useState('');

  if (isLoading) return <div className="p-8">Loading Profile...</div>;
  if (!customer) return <div className="p-8">Customer not found.</div>;

  const handleAssignOnu = () => {
    if (!onuSerial) return;
    assignOnu.mutate({ id: customer.id, data: { serial_number: onuSerial } });
  };

  const handleAssignPackage = () => {
    if (!packageId) return;
    assignPackage.mutate({ id: customer.id, data: { package_profile_id: packageId } });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push('/customers')}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{customer.full_name}</h1>
          <p className="text-muted-foreground mt-1">Code: {customer.customer_code}</p>
        </div>
        <div className="text-right border rounded-lg p-3 bg-muted/30">
          <p className="text-sm text-muted-foreground">Current Status</p>
          <p className="text-lg font-bold tracking-wide">{customer.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        {/* Core Identity Panel */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" /> 
              Identity Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{customer.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{customer.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned ODP UUID</p>
              <p className="font-medium text-xs font-mono">{customer.odp_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{format(new Date(customer.created_at), 'PPP')}</p>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-2 space-y-6">
          {/* Hardware & Billing Assignment */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Router className="w-4 h-4 mr-2" /> 
                  ONU Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.customer_onu ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                    <p className="text-xs text-green-700 font-semibold mb-1">ASSIGNED DEVICE</p>
                    <p className="font-mono text-sm">{customer.customer_onu.serial_number}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-red-500 font-semibold">NO DEVICE ASSIGNED</p>
                    <input 
                      placeholder="Enter Serial Number" 
                      className="w-full text-sm p-2 border rounded"
                      value={onuSerial}
                      onChange={e => setOnuSerial(e.target.value)}
                    />
                    <Button size="sm" className="w-full" onClick={handleAssignOnu} disabled={assignOnu.isPending}>
                      Assign ONU
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <CreditCard className="w-4 h-4 mr-2" /> 
                  Billing Package
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.customer_package ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                    <p className="text-xs text-green-700 font-semibold mb-1">ACTIVE PROFILE UUID</p>
                    <p className="font-mono text-xs truncate">{customer.customer_package.package_profile_id}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-red-500 font-semibold">NO PACKAGE ASSIGNED</p>
                    <input 
                      placeholder="Enter Package Profile UUID" 
                      className="w-full text-sm p-2 border rounded font-mono"
                      value={packageId}
                      onChange={e => setPackageId(e.target.value)}
                    />
                    <Button size="sm" className="w-full" onClick={handleAssignPackage} disabled={assignPackage.isPending}>
                      Assign Package
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lifecycle Workflows */}
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle Workflows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div>
                  <h4 className="font-medium flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-green-500" />
                    Activate Service
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Transitions customer to ACTIVE state. Requires ONU and Package.</p>
                </div>
                <Button 
                  onClick={() => activate.mutate(customer.id)} 
                  disabled={customer.status === 'ACTIVE' || activate.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {activate.isPending ? 'Processing...' : 'Activate'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div>
                  <h4 className="font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    Relocate Service
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Move this customer to a new ODP port.</p>
                </div>
                <div className="flex space-x-2">
                  <input 
                    placeholder="New ODP UUID" 
                    className="w-48 text-sm p-2 border rounded font-mono"
                    value={newOdpId}
                    onChange={e => setNewOdpId(e.target.value)}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => relocate.mutate({ id: customer.id, newOdpId })} 
                    disabled={!newOdpId || relocate.isPending}
                  >
                    Relocate
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <div>
                  <h4 className="font-medium flex items-center text-red-600">
                    <XCircle className="w-4 h-4 mr-2" />
                    Terminate Service
                  </h4>
                  <p className="text-sm text-red-600/80 mt-1">Permanently cease service for this customer.</p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to terminate this customer?')) {
                      terminate.mutate(customer.id);
                    }
                  }} 
                  disabled={customer.status === 'TERMINATED' || terminate.isPending}
                >
                  Terminate
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

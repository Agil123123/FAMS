'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success(`Password reset link sent to ${data.email}`);
        resolve(true);
      }, 1000);
    });
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="h-10 w-10" />
          <span className="text-3xl font-bold tracking-tight text-white">FAMS</span>
        </div>
      </div>
      
      <Card className="border-neutral-800 bg-neutral-900 shadow-xl shadow-black/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Reset Password</CardTitle>
          <CardDescription className="text-center text-neutral-400">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@fams.id"
                {...register('email')}
                className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-primary"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

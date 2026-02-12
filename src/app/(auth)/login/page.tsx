'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { type LoginFormData, LoginSchema } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth(); // Added loginError
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });
  const onSubmit = (data: LoginFormData) => {
    login(data); // No try-catch needed, error is in loginError
  };
  // Get error message from loginError
  const errorMessage = loginError
    ? loginError instanceof Error
      ? loginError.message
      : 'Login failed. Please check your credentials.'
    : null;
  return (
    <Card className='border-0 bg-white shadow-2xl'>
      <div className='p-8 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-center gap-2'>
          <Shield className='w-8 h-8 text-blue-600' />
          <div>
            <h1 className='text-2xl font-bold text-slate-900'>SHA FDS</h1>
            <p className='text-xs text-slate-500'>Fraud Detection System</p>
          </div>
        </div>
        {/* Title */}
        <div className='text-center space-y-2'>
          <h2 className='text-xl font-semibold text-slate-900'>Welcome Back</h2>
          <p className='text-sm text-slate-600'>
            Sign in to continue to the fraud detection system
          </p>
        </div>
        {/* Error Message */}
        {errorMessage && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600'>
            {errorMessage}
          </div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-slate-700 mb-1.5'
            >
              Username
            </label>
            <Input
              id='username'
              type='text'
              placeholder='Enter your username'
              {...register('username')}
              disabled={isLoggingIn}
              className='w-full'
            />
            {errors.username && (
              <p className='mt-1 text-xs text-red-600'>
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-slate-700 mb-1.5'
            >
              Password
            </label>
            <Input
              id='password'
              type='password'
              placeholder='Enter your password'
              {...register('password')}
              disabled={isLoggingIn}
              className='w-full'
            />
            {errors.password && (
              <p className='mt-1 text-xs text-red-600'>
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type='submit'
            disabled={isLoggingIn}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white'
          >
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        {/* Demo Credentials */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1 text-xs'>
          <p className='font-medium text-blue-900'>Demo Credentials:</p>
          <p className='text-blue-800'>
            Username: <span className='font-mono font-semibold'>demo</span>
          </p>
          <p className='text-blue-800'>
            Password: <span className='font-mono font-semibold'>demo123</span>
          </p>
        </div>
      </div>
    </Card>
  );
}

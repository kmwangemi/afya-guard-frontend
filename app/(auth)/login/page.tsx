'use client';

import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/queries/useLogin';
import { handleApiError } from '@/lib/api';
import { LoginFormValues, loginSchema } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const onSubmit = (values: LoginFormValues) => login(values); // onSuccess/onError handled inside the hook
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4'>
      <div className='w-full max-w-md'>
        {/* Logo and Title */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 mb-4'>
            <span className='text-white font-bold text-lg'>SHA</span>
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Fraud Intelligence Engine
          </h1>
          <p className='text-gray-600'>Healthcare Fraud Detection System</p>
        </div>
        {/* Card */}
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Sign In</h2>
          {/* Error Message — now comes from React Query */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3'>
              <AlertCircle className='h-5 w-5 text-red-600 flex-shrink-0 mt-0.5' />
              <p className='text-sm font-medium text-red-900'>
                {handleApiError(error)}
              </p>
            </div>
          )}
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              {/* Email */}
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='you@example.com'
                        {...field}
                        disabled={isPending}
                        className='border-gray-300'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Password */}
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='••••••••'
                        {...field}
                        disabled={isPending}
                        className='border-gray-300'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Submit Button */}
              <Button
                type='submit'
                className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2'
                disabled={isPending}
              >
                {isPending ? (
                  <div className='flex items-center gap-2'>
                    <span className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
          {/* Forgot Password Link */}
          <div className='my-2 text-center'>
            <a
              href='#'
              className='text-sm text-blue-600 hover:text-blue-700 font-medium'
            >
              Forgot your password?
            </a>
          </div>
          {/* Demo Credentials */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1 text-xs'>
            <p className='font-medium text-blue-900'>Demo Credentials:</p>
            <p className='text-blue-800'>
              Username:{' '}
              <span className='font-mono font-semibold'>
                admin@afyaguard.go.ke
              </span>
            </p>
            <p className='text-blue-800'>
              Password:{' '}
              <span className='font-mono font-semibold'>AfyaGuard@2026!</span>
            </p>
          </div>
        </div>
        {/* Footer */}
        <p className='mt-8 text-center text-sm text-gray-600'>
          SHA Fraud Intelligence Engine v1.0
        </p>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Input } from './ui/input';

interface PasswordInputProps extends React.ComponentProps<'input'> {
  className?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className='relative'>
        <Input
          className={cn('pe-10', className)}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          {...props}
        />
        <button
          className='absolute right-4 top-1/2 -translate-y-1/2 transform text-muted-foreground'
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? 'Hide password' : 'Show password'}
          type='button'
        >
          {showPassword ? (
            <EyeOff className='size-5' />
          ) : (
            <Eye className='size-5' />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

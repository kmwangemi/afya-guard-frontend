import { type LucideIcon } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center min-h-100 text-center p-6'>
      {Icon && <Icon className='w-12 h-12 text-muted-foreground mb-4' />}
      <h3 className='text-lg font-semibold text-foreground mb-2'>{title}</h3>
      {description && (
        <p className='text-sm text-muted-foreground mb-6 max-w-md'>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

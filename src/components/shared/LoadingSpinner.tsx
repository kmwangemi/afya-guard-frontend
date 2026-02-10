export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  return (
    <div
      className={`inline-block ${sizeClasses[size]} animate-spin rounded-full border-4 border-slate-200 border-t-blue-600`}
    />
  );
}

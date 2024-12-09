import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive';
}

export const Button = ({ 
  children, 
  variant = 'default', 
  className, 
  ...props 
}: ButtonProps) => {
  const variantClasses = {
    default: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    destructive: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <button
      className={cn(
        'px-4 py-2 rounded transition-colors disabled:opacity-50',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
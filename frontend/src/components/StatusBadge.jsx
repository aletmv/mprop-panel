import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  success: 'bg-success-soft text-success border border-success/20',
  warning: 'bg-warning-soft text-warning-foreground border border-warning/30',
  destructive: 'bg-destructive-soft text-destructive border border-destructive/20',
  info: 'bg-info-soft text-info border border-info/20',
  muted: 'bg-muted text-muted-foreground border border-border',
  primary: 'bg-primary/8 text-primary border border-primary/15',
};

export const StatusBadge = ({ children, variant = 'muted', dot = true, className }) => {
  const dotColor = {
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-info',
    muted: 'bg-muted-foreground/50',
    primary: 'bg-primary',
  }[variant];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap',
      variants[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />}
      {children}
    </span>
  );
};

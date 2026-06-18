import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProgressStepper = ({ pasos, pasoActual, observado = false }) => {
  const currentIdx = pasos.findIndex(p => p === pasoActual);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {pasos.map((paso, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isObs = isCurrent && observado;
          return (
            <React.Fragment key={paso}>
              <div className="flex flex-col items-center min-w-0">
                <div className={cn(
                  'w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold border-2 transition-colors shrink-0',
                  isDone && 'bg-success border-success text-success-foreground',
                  isCurrent && !isObs && 'bg-card border-primary text-primary ring-4 ring-primary/10',
                  isObs && 'bg-card border-destructive text-destructive ring-4 ring-destructive/10',
                  !isDone && !isCurrent && 'bg-card border-border text-muted-foreground'
                )}>
                  {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : idx + 1}
                </div>
                <div className={cn(
                  'mt-2 text-[11px] font-medium whitespace-nowrap',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  isObs && 'text-destructive'
                )}>{paso}</div>
              </div>
              {idx < pasos.length - 1 && (
                <div className={cn(
                  'flex-1 h-[2px] mx-1 -mt-5 rounded-full',
                  idx < currentIdx ? 'bg-success' : 'bg-border'
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

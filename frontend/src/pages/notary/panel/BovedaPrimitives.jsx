import { formatUSD } from '@/data/mock';

export const PagosItemRow = ({ label, detail, amount, zero }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
    <div className="min-w-0">
      <div className="text-sm font-medium text-slate-900">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5">{detail}</div>
    </div>
    {zero ? (
      <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">{zero}</span>
    ) : (
      <span className="text-sm font-semibold text-slate-900 tabular-nums whitespace-nowrap">{formatUSD(amount)}</span>
    )}
  </div>
);

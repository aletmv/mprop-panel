import { formatUSD } from '@/data/mock';
import { Pill } from './OperacionDetailPrimitives';

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

export const HitoRow = ({ label, subtitle, amount, pill, accent = 'mp', testid }) => {
  // accent="mp" → hito procesado por MercadoPago (azul sutil)
  // accent="notary" → hito programado ante escribanía (slate, diferenciado)
  const tone = accent === 'notary'
    ? 'border-l-slate-400 bg-slate-50/50'
    : 'border-l-sky-400 bg-sky-50/40';
  return (
    <div
      data-testid={testid}
      className={`px-5 py-4 flex items-start justify-between gap-3 border-l-2 ${tone}`}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold text-slate-900 tabular-nums">{formatUSD(amount)}</div>
        {pill && (
          <div className="mt-1">
            <Pill variant={pill.variant}>{pill.label}</Pill>
          </div>
        )}
      </div>
    </div>
  );
};

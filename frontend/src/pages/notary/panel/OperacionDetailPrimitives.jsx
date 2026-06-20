export const StatusDot = ({ variant = 'muted', label, className = '' }) => {
  const dot = {
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-info',
    muted: 'bg-slate-400',
    primary: 'bg-primary',

    'stage-inicio': 'bg-[var(--stage-inicio)]',
    'stage-expediente': 'bg-[var(--stage-expediente)]',
    'stage-diligence': 'bg-[var(--stage-diligence)]',
    'stage-precierre': 'bg-[var(--stage-precierre)]',
    'stage-cierre': 'bg-[var(--stage-cierre)]',
  }[variant];
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium text-slate-700 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

export const Pill = ({ variant = 'muted', children, className = '' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    destructive: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    muted: 'bg-slate-50 text-slate-600 border-slate-200',
    primary: 'bg-sky-50 text-sky-700 border-sky-200',
  }[variant];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}>
      {children}
    </span>
  );
};

export const SectionLabel = ({ children }) => (
  <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500">{children}</div>
);

export const Card = ({ children, className = '', ...rest }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`} {...rest}>
    {children}
  </div>
);

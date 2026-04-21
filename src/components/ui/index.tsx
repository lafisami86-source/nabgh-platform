import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ─── Button ───────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}
const btnVariants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md active:scale-95',
  secondary: 'bg-secondary text-white hover:opacity-90 active:scale-95',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:scale-95',
  ghost: 'text-slate-600 hover:bg-slate-100 active:scale-95',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95',
};
const btnSizes = { xs: 'h-7 px-3 text-xs', sm: 'h-8 px-4 text-sm', md: 'h-10 px-5 text-sm', lg: 'h-12 px-6 text-base' };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none font-cairo',
        btnVariants[variant], btnSizes[size], fullWidth && 'w-full', className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

// ─── Card ─────────────────────────────────────────────────────────
export function Card({ className, children, hover = false, padding = true, ...props }: {
  className?: string; children: React.ReactNode; hover?: boolean; padding?: boolean; [key: string]: any
}) {
  return (
    <div
      className={cn('bg-white rounded-xl border border-slate-100 shadow-card', hover && 'card-hover cursor-pointer', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 py-4 border-b border-slate-100 font-cairo', className)}>{children}</div>;
}
export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

// ─── Progress ─────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'bg-primary-500', size = 'md', label, className }: {
  value: number; max?: number; color?: string; size?: 'xs' | 'sm' | 'md' | 'lg'; label?: boolean; className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  return (
    <div className={cn('w-full', className)}>
      {label && <div className="text-xs text-slate-500 mb-1 font-numbers">{Math.round(pct)}%</div>}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', heights[size])}>
        <div className={cn('h-full rounded-full transition-all duration-700 ease-out', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CircularProgress({ value, size = 80, strokeWidth = 8, color = '#6366F1', children }: {
  value: number; size?: number; strokeWidth?: number; color?: string; children?: React.ReactNode;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}

// ─── Badge (pill) ─────────────────────────────────────────────────
export function Badge({ children, color = 'primary', size = 'sm' }: {
  children: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'gray' | 'purple';
  size?: 'xs' | 'sm' | 'md';
}) {
  const colors = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-slate-50 text-slate-600 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  const sizes = { xs: 'text-xs px-1.5 py-0.5', sm: 'text-xs px-2 py-1', md: 'text-sm px-3 py-1' };
  return (
    <span className={cn('inline-flex items-center rounded-full border font-medium', colors[color], sizes[size])}>
      {children}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-lg bg-slate-200', className)} />;
}

// ─── Avatar ───────────────────────────────────────────────────────
export function Avatar({ src, name, size = 'md', level }: {
  src?: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; level?: number;
}) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl', xl: 'w-20 h-20 text-2xl' };
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div className="relative inline-block">
      <div className={cn('rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center overflow-hidden ring-2 ring-white', sizes[size])}>
        {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{initials}</span>}
      </div>
      {level && (
        <div className="absolute -bottom-1 -left-1 bg-amber-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
          {level}
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-xl w-full slide-up', widths[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-lg font-cairo">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────
export function Input({ label, error, className, icon, ...props }: {
  label?: string; error?: string; className?: string; icon?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          className={cn('w-full h-10 border rounded-lg px-3 text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition', icon && 'pr-10', error ? 'border-red-300' : 'border-slate-200', className)}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

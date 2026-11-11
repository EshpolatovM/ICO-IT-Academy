import { cn } from '@/lib/cn';

export type SpinnerSize = 'sm' | 'md';

export interface SpinnerProps {
  size?: SpinnerSize;
  /** Ekran o'quvchilar uchun matn. */
  label?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
};

/** Yuklanish ko'rsatkichi (yagona ruxsat etilgan animatsiya — aylanish). */
export function Spinner({ size = 'md', label = 'Yuklanmoqda', className }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex items-center', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'inline-block animate-spin rounded-full border-current border-r-transparent',
          sizeClasses[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

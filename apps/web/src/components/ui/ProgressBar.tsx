import { useId } from 'react';

import { cn } from '@/lib/cn';

const PERCENT_MAX = 100;

export interface ProgressBarProps {
  /** Ulush: 0 dan 1 gacha (chegaradan tashqari qiymatlar qirqiladi). */
  value: number;
  /** Ko'rinadigan nom ("Yo'l progressi"); `aria-labelledby` orqali bog'lanadi. */
  label: string;
  /** Foiz matnini ko'rsatish (standart: ha). */
  showValue?: boolean;
  className?: string;
}

/** `value` ni 0–100 butun foizga aylantiradi (NaN → 0). */
export function toPercent(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  const clamped = Math.min(Math.max(value, 0), 1);
  return Math.round(clamped * PERCENT_MAX);
}

/** Oddiy chiziqli progress: nom, foiz matni va to'ldirilgan chiziq. Animatsiyasiz. */
export function ProgressBar({ value, label, showValue = true, className }: ProgressBarProps) {
  const labelId = useId();
  const percent = toPercent(value);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span id={labelId} className="text-text">
          {label}
        </span>
        {showValue ? <span className="text-text-muted">{percent}%</span> : null}
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={PERCENT_MAX}
        aria-valuenow={percent}
        aria-valuetext={`${percent}%`}
        className="h-2 w-full overflow-hidden rounded-sm border border-border bg-surface-muted"
      >
        {/* Dinamik kenglik: components/ui ichida yagona ruxsat etilgan inline style. */}
        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

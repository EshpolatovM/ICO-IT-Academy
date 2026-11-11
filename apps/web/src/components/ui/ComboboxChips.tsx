import { cn } from '@/lib/cn';

import { Badge } from './Badge';
import { focusRing } from './classes';

import type { ComboboxOption } from './Combobox.types';

export interface ComboboxChipsProps {
  options: readonly ComboboxOption[];
  removeLabel: string;
  disabled: boolean;
  onRemove: (option: ComboboxOption) => void;
}

/** `multiple` rejimida tanlanganlar: har biri Badge + "olib tashlash" tugmasi. */
export function ComboboxChips({ options, removeLabel, disabled, onRemove }: ComboboxChipsProps) {
  return options.map((option) => (
    <Badge key={option.value} className="gap-1">
      {option.label}
      <button
        type="button"
        disabled={disabled}
        aria-label={`${option.label} — ${removeLabel}`}
        onClick={() => {
          onRemove(option);
        }}
        className={cn(
          'rounded-sm px-0.5 text-text-muted hover:text-text disabled:cursor-not-allowed',
          focusRing,
        )}
      >
        <span aria-hidden="true">×</span>
      </button>
    </Badge>
  ));
}

import { cn } from '@/lib/cn';

import type { HTMLAttributes } from 'react';

export type StackDirection = 'vertical' | 'horizontal';
/** Bo'shliq — Tailwind standart 4px shkalasidan qadamlar. */
export type StackGap = 'none' | '1' | '2' | '3' | '4' | '6' | '8';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: StackDirection;
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
}

const directionClasses: Record<StackDirection, string> = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
};

const gapClasses: Record<StackGap, string> = {
  none: 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '6': 'gap-6',
  '8': 'gap-8',
};

const alignClasses: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};

/** Elementlarni vertikal yoki gorizontal qatorga bir xil oraliq bilan teradi. */
export function Stack({
  direction = 'vertical',
  gap = '4',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  ...rest
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        className,
      )}
      {...rest}
    />
  );
}

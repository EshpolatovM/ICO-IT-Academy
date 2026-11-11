import { cn } from '@/lib/cn';

import { focusRing } from './classes';
import { EmptyState } from './EmptyState';

import type { HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes } from 'react';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /**
   * Gorizontal scroll konteyneri nomi. Berilsa konteyner `role="region"` + `tabIndex=0` bo'ladi —
   * klaviatura foydalanuvchisi tor ekranda jadvalni strelkalar bilan aylantira oladi.
   */
  scrollLabel?: string;
  containerClassName?: string;
}

/** Jadval: chegarali konteyner ichida, tor ekranda gorizontal scroll bilan. */
export function Table({ scrollLabel, containerClassName, className, ...rest }: TableProps) {
  const regionProps =
    scrollLabel !== undefined
      ? { role: 'region', 'aria-label': scrollLabel, tabIndex: 0 }
      : undefined;

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-md border border-border bg-bg',
        focusRing,
        containerClassName,
      )}
      {...regionProps}
    >
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...rest} />
    </div>
  );
}

export function TableHeader({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-border bg-surface', className)} {...rest} />;
}

export function TableBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...rest} />;
}

export function TableRow({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-border-muted last:border-b-0', className)} {...rest} />;
}

export function TableCell({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-3 py-2 align-middle text-text', className)} {...rest} />;
}

export interface TableEmptyProps {
  /** Jadvaldagi ustunlar soni — bo'sh holat butun qatorni egallaydi. */
  colSpan: number;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Ma'lumot bo'lmaganda `tbody` ichida ko'rsatiladigan qator (EmptyState bilan). */
export function TableEmpty({ colSpan, title, description, action }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-4">
        <EmptyState title={title} description={description} action={action} />
      </td>
    </tr>
  );
}
